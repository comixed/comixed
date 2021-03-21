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
import { WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/logger';
import { Subscription } from 'webstomp-client';
import {
  LOAD_SCAN_TYPES_MESSAGE,
  SCAN_TYPE_UPDATE_TOPIC
} from '@app/library/library.constants';
import { scanTypeAdded } from '@app/library/actions/scan-type.actions';
import { ScanType } from '@app/library';

@Injectable({
  providedIn: 'root'
})
export class ScanTypeService {
  let;
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.subscription) {
        this.logger.trace('Loading scan types');
        this.webSocketService.requestResponse<ScanType>(
          LOAD_SCAN_TYPES_MESSAGE,
          '',
          SCAN_TYPE_UPDATE_TOPIC,
          scanType => {
            this.logger.debug('Received scan type:', scanType);
            this.store.dispatch(scanTypeAdded({ scanType }));
          }
        );

        this.logger.trace('Subscribing to scan type updates');
        this.subscription = this.webSocketService.subscribe<ScanType>(
          SCAN_TYPE_UPDATE_TOPIC,
          scanType => {
            this.logger.debug('Received scan type:', scanType);
            this.store.dispatch(scanTypeAdded({ scanType }));
          }
        );
        this.webSocketService.send(LOAD_SCAN_TYPES_MESSAGE, '');
      }
      if (!state.started && !!this.subscription) {
        this.logger.trace('Unsubscribing from scan type updates');
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }
}
