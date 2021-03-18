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
import { Subscription } from 'webstomp-client';
import { LoggerService } from '@angular-ru/logger';
import { WebSocketService } from '@app/messaging';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { IMPORT_COUNT_TOPIC } from '@app/app.constants';
import { importCountUpdated } from '@app/actions/import-count.actions';
import { ImportCount } from '@app/models/messages/import-count';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImportCountService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store
      .select(selectMessagingState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        if (state.started && !this.subscription) {
          this.logger.trace('Subscribing to import count updates');
          this.subscription = this.webSocketService.subscribe(
            IMPORT_COUNT_TOPIC,
            frame => {
              const update = JSON.parse(frame.body) as ImportCount;
              this.logger.debug('Received import count update:', update);
              this.store.dispatch(
                importCountUpdated({
                  count: update.addCount + update.processingCount
                })
              );
            }
          );
        }
        if (!state.started && !!this.subscription) {
          this.logger.trace('Unsubscribing from import count updates');
          this.subscription.unsubscribe();
          this.logger.trace('Clearing subscription');
          this.subscription = null;
        }
      });
  }
}
