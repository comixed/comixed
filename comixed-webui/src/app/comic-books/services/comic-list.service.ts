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
import { Store } from '@ngrx/store';
import { WebSocketService } from '@app/messaging';
import { LoggerService } from '@angular-ru/cdk/logger';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { COMIC_LIST_UPDATE_TOPIC } from '@app/library/library.constants';
import { Comic } from '@app/comic-books/models/comic';
import { comicListUpdateReceived } from '@app/comic-books/actions/comic-list.actions';

@Injectable({
  providedIn: 'root'
})
export class ComicListService {
  subscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.subscription) {
        this.logger.trace('Subscribing to comic list updates');
        this.subscription = this.webSocketService.subscribe<Comic>(
          COMIC_LIST_UPDATE_TOPIC,
          comic => {
            this.logger.debug('Received comic list update:', comic);
            this.store.dispatch(comicListUpdateReceived({ comic }));
          }
        );
      }

      if (!state.started && !!this.subscription) {
        this.logger.trace('Unsubscribing from comic list updates');
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    });
  }
}
