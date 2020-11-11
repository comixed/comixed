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
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { TokenService } from '@app/core';
import {
  HTTP_AUTHORIZATION_HEADER,
  HTTP_REQUESTED_WITH_HEADER,
  HTTP_XML_REQUEST
} from '@app/app.constants';
import { retry, tap } from 'rxjs/operators';

@Injectable()
export class HttpInterceptor implements HttpInterceptor {
  constructor(
    private logger: LoggerService,
    private tokenService: TokenService
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
      retry(3),
      tap(response => {
        this.logger.trace('Response received:', response);
      })
    );
  }
}
