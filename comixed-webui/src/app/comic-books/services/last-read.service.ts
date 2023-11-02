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
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'webstomp-client';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import {
  lastReadDateRemoved,
  lastReadDateUpdated,
  loadUnreadComicBookCount
} from '@app/comic-books/actions/last-read-list.actions';
import { WebSocketService } from '@app/messaging';
import { LastRead } from '@app/comic-books/models/last-read';
import {
  LAST_READ_REMOVED_TOPIC,
  LAST_READ_UPDATED_TOPIC,
  LOAD_UNREAD_COMIC_BOOK_COUNT_URL,
  SET_COMIC_BOOK_READ_STATE_URL,
  SET_SELECTED_COMIC_BOOKS_READ_STATE_URL
} from '@app/comic-books/comic-books.constants';

@Injectable({
  providedIn: 'root'
})
export class LastReadService {
  updateSubscription: Subscription;
  removeSubscription: Subscription;
  loaded = false;

  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private store: Store<any>,
    private webSocketService: WebSocketService
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started) {
        if (!this.updateSubscription) {
          this.updateSubscription = this.webSocketService.subscribe<LastRead>(
            LAST_READ_UPDATED_TOPIC,
            entry => {
              this.logger.debug('Last read entry updated:', entry);
              this.store.dispatch(lastReadDateUpdated({ entry }));
              this.store.dispatch(loadUnreadComicBookCount());
            }
          );
          this.store.dispatch(loadUnreadComicBookCount());
        }
        if (!this.removeSubscription) {
          this.removeSubscription = this.webSocketService.subscribe<LastRead>(
            LAST_READ_REMOVED_TOPIC,
            entry => {
              this.logger.debug('Last read entry removed:', entry);
              this.store.dispatch(lastReadDateRemoved({ entry }));
              this.store.dispatch(loadUnreadComicBookCount());
            }
          );
        }
      }

      if (!state.started) {
        if (!!this.updateSubscription) {
          this.logger.trace('Unsubscribing from last read updates');
          this.updateSubscription.unsubscribe();
          this.updateSubscription = null;
          this.loaded = false;
        }
        if (!!this.removeSubscription) {
          this.logger.trace('Unsubscribing from last read removals');
          this.removeSubscription.unsubscribe();
          this.removeSubscription = null;
        }
      }
    });
  }

  loadUnreadComicBookCount(): Observable<any> {
    this.logger.debug('Loading unread comic book count');
    return this.http.get(interpolate(LOAD_UNREAD_COMIC_BOOK_COUNT_URL));
  }

  setSingleReadState(args: {
    comicBookId: number;
    read: boolean;
  }): Observable<any> {
    if (args.read) {
      this.logger.debug('Service: marking comic book as read:', args);
      return this.http.put(
        interpolate(SET_COMIC_BOOK_READ_STATE_URL, {
          comicBookId: args.comicBookId
        }),
        {}
      );
    } else {
      this.logger.debug('Service: markin comic book as unread:', args);
      return this.http.delete(
        interpolate(SET_COMIC_BOOK_READ_STATE_URL, {
          comicBookId: args.comicBookId
        })
      );
    }
  }

  setSelectedReadState(args: { read: boolean }): Observable<any> {
    if (args.read) {
      this.logger.debug('Service: marking selected comic books as read:', args);
      return this.http.put(
        interpolate(SET_SELECTED_COMIC_BOOKS_READ_STATE_URL),
        {}
      );
    } else {
      this.logger.debug(
        'Service: marking selected comic books as unread:',
        args
      );
      return this.http.delete(
        interpolate(SET_SELECTED_COMIC_BOOKS_READ_STATE_URL)
      );
    }
  }
}
