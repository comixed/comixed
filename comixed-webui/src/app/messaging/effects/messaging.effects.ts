/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  messagingStarted,
  messagingStopped,
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { WebSocketService } from '@app/messaging/services/web-socket.service';
import { LoggerService } from '@angular-ru/logger';
import { of } from 'rxjs';

@Injectable()
export class MessagingEffects {
  startMessaging$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(startMessaging),
      tap(action => this.logger.debug('Effect: start messaging:', action)),
      switchMap(() =>
        this.webSocketService.connect().pipe(map(() => messagingStarted()))
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        return of(messagingStopped());
      })
    );
  });

  stopMessaging$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(stopMessaging),
      tap(action => this.logger.debug('Effect: stop messaging:', action)),
      switchMap(() =>
        this.webSocketService.disconnect().pipe(map(() => messagingStopped()))
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        return of(messagingStopped());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private webSocketService: WebSocketService
  ) {}
}
