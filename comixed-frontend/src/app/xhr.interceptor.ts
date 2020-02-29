import {
  HttpErrorResponse,
  HttpHandler,
  HttpHeaderResponse,
  HttpInterceptor,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
  HttpUserEvent
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationAdaptor, TokenService } from 'app/user';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

export const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class XhrInterceptor implements HttpInterceptor {
  constructor(
    private logger: NGXLogger,
    private tokenService: TokenService,
    private router: Router,
    private authenticationAdaptor: AuthenticationAdaptor
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
  > {
    let authReq = req;
    if (this.tokenService.getToken() !== null) {
      authReq = req.clone({
        headers: req.headers
          .set(TOKEN_HEADER_KEY, `Bearer ${this.tokenService.getToken()}`)
          .set('X-Request-With', 'XMLHttpRequest')
      });
    } else {
      authReq = req.clone({
        headers: req.headers.set('X-Request-With', 'XMLHttpRequest')
      });
    }
    return next.handle(authReq).pipe(
      retry(2),
      catchError((error: HttpErrorResponse) => {
        switch (error.status || 200) {
          case 200:
          case 503:
          case 504:
            this.logger.debug('[XHR] no error:', error);
            return;
          case 401:
            this.logger.error('[XHR] user not authenticated:', error);
            this.authenticationAdaptor.startLogout();
            this.router.navigateByUrl('/');
            break;
          default:
            this.logger.error('[XHR] rethrowing error:', error);
            return throwError(error);
        }
      })
    );
  }
}
