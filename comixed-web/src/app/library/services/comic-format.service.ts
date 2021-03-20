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
  COMIC_FORMAT_UPDATE_TOPIC,
  LOAD_COMIC_FORMATS_MESSAGE
} from '@app/library/library.constants';
import { comicFormatAdded } from '@app/library/actions/comic-format.actions';
import { ComicFormat } from '@app/library';

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
        this.logger.trace('Loading the comic formats');
        this.webSocketService.requestResponse<ComicFormat>(
          LOAD_COMIC_FORMATS_MESSAGE,
          '',
          COMIC_FORMAT_UPDATE_TOPIC,
          format => {
            this.logger.debug('Received comic format:', format);
            this.store.dispatch(comicFormatAdded({ format }));
          }
        );

        this.logger.trace('Subscribing to comic format updates');
        this.subscription = this.webSocketService.subscribe<ComicFormat>(
          COMIC_FORMAT_UPDATE_TOPIC,
          format => {
            this.logger.debug('Received comic format:', format);
            this.store.dispatch(comicFormatAdded({ format }));
          }
        );
      }
      if (!state.started && !!this.subscription) {
        this.logger.trace('Unsubscribing from comic format updates');
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }
}
