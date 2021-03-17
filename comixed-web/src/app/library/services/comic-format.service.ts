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
import { Store } from '@ngrx/store';
import { WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import {
  COMIC_FORMAT_ADD_QUEUE,
  LOAD_COMIC_FORMATS_MESSAGE
} from '@app/library/library.constants';
import { comicFormatAdded } from '@app/library/actions/comic-format.actions';

@Injectable({
  providedIn: 'root'
})
export class ComicFormatService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.subscription) {
        this.logger.trace('Subscribing to scan type updates');
        this.subscription = this.webSocketService.subscribe(
          COMIC_FORMAT_ADD_QUEUE,
          frame => {
            const format = JSON.parse(frame.body);
            this.logger.debug('Received comic format:', format);
            this.store.dispatch(comicFormatAdded({ format }));
          }
        );
        this.webSocketService.send(LOAD_COMIC_FORMATS_MESSAGE, '');
      }
      if (!state.started && !!this.subscription) {
        this.logger.trace('Unsubscribing from scan type updates');
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }
}
