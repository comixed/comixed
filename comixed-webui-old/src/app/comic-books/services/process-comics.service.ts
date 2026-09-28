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

import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { WebSocketService } from '@app/messaging';
import { Store } from '@ngrx/store';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';
import { PROCESS_COMICS_TOPIC } from '@app/app.constants';
import { importComicsUpdate } from '@app/actions/import-comics.actions';
import { ProcessComicsStatus } from '@app/models/messages/process-comics-status';
import { filter, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessComicsService {
  logger = inject(LoggerService);
  store = inject(Store);
  webSocketService = inject(WebSocketService);

  constructor() {
    this.store
      .select(selectMessagingStarted)
      .pipe(
        filter(started => started),
        tap(() => {
          this.logger.trace('Subscribing to import count updates');
          this.webSocketService.subscribe<ProcessComicsStatus>(
            PROCESS_COMICS_TOPIC,
            update => {
              this.logger.debug(
                'Received process comic status update:',
                update
              );
              this.store.dispatch(
                importComicsUpdate({
                  active: update.active,
                  stepName: update.stepName,
                  total: update.total,
                  processed: update.processed
                })
              );
            }
          );
        })
      )
      .subscribe();
  }

  beep() {
    this.logger.trace('Just acknowledging things');
  }
}
