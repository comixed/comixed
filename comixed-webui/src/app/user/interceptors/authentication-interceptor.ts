/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '@app/user/services/token-service';
import {
  HTTP_AUTHORIZATION_HEADER,
  HTTP_REQUESTED_WITH_HEADER,
  HTTP_XML_REQUEST,
  LOGIN_PAGE_URL
} from '@app/user/user-constants';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { LoggerService } from '@angular-ru/cdk/logger';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const authService = inject(TokenService);
  const router = inject(Router);
  const authToken = authService.getAuthToken();

  logger.trace('Cloning request header');
  let newReq = req.clone({
    headers: req.headers.set(HTTP_REQUESTED_WITH_HEADER, HTTP_XML_REQUEST)
  });
  logger.trace('Loading auth token');
  if (authToken.length === 0) {
    logger.debug('No auth token: redirecting to login page');
    router.navigateByUrl(LOGIN_PAGE_URL);
  } else {
    logger.trace('Cloning request, adding auth token');
    newReq = newReq.clone({
      headers: newReq.headers.set(
        HTTP_AUTHORIZATION_HEADER,
        `Bearer ${authToken}`
      )
    });
  }
  return next(newReq).pipe(
    catchError(error => {
      logger.error('HTTP error:', error);
      /* istanbul ignore if */
      if (error instanceof HttpErrorResponse) {
        logger.trace('Received response code:', error.status);
        if (error.status === 401) {
          router.navigateByUrl(LOGIN_PAGE_URL);
        }
      }
      return of(error);
    })
  );
};
