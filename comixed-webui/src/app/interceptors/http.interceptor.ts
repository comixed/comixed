/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  HTTP_AUTHORIZATION_HEADER,
  HTTP_REQUESTED_WITH_HEADER,
  HTTP_XML_REQUEST
} from '@app/app.constants';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from '@app/core/services/token.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { logoutUser } from '@app/user/actions/user.actions';

@Injectable()
export class HttpInterceptor implements HttpInterceptor {
  constructor(
    private logger: LoggerService,
    private tokenService: TokenService,
    private store: Store<any>,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let requestClone = request.clone({
      headers: request.headers.set(HTTP_REQUESTED_WITH_HEADER, HTTP_XML_REQUEST)
    });

    this.logger.trace('Processing outgoing HTTP request');
    if (this.tokenService.hasAuthToken()) {
      this.logger.trace('Adding authentication token to request');
      const token = this.tokenService.getAuthToken();
      requestClone = requestClone.clone({
        headers: requestClone.headers.set(
          HTTP_AUTHORIZATION_HEADER,
          `Bearer ${token}`
        )
      });
    }
    return next.handle(requestClone).pipe(
      tap(response => this.logger.debug('Response received:', response)),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          this.logger.error('Error response received', error);
          if (error.status !== 401) {
            return throwError(error);
          }
          this.logger.info('Ensuring user is logged out');
          this.store.dispatch(logoutUser());
          this.logger.info('Redirecting to login page');
          this.router.navigateByUrl('/login');
          return throwError(error);
        }
        return of(error);
      })
    );
  }
}
