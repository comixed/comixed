import { tap } from 'rxjs/operators';
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpErrorResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TokenStorage } from 'app/storage/token.storage';
import { MessageService } from 'primeng/api';

export const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class XhrInterceptor implements HttpInterceptor {
  constructor(
    private token_storage: TokenStorage,
    private router: Router,
    private message_service: MessageService
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
    if (this.token_storage.get_token() !== null) {
      authReq = req.clone({
        headers: req.headers
          .set(TOKEN_HEADER_KEY, `Bearer ${this.token_storage.get_token()}`)
          .set('X-Request-With', 'XMLHttpRequest')
      });
    } else {
      authReq = req.clone({
        headers: req.headers.set('X-Request-With', 'XMLHttpRequest')
      });
    }
    return next.handle(authReq).pipe(
      tap((error: any) => {
        if (error instanceof HttpResponse) {
          if (error.status !== 200) {
            this.message_service.add({
              severity: 'error',
              summary: 'Server Error',
              detail: 'Unable to complete the last request...'
            });
          }
        }
      })
    );
  }
}
