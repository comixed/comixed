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
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  CLEAR_COMIC_READ_STATUS_URL,
  LAST_READ_REMOVE_TOPIC,
  LAST_READ_UPDATE_TOPIC,
  LOAD_LAST_READ_ENTRIES_URL,
  SET_COMIC_READ_STATUS_URL
} from '@app/last-read/last-read.constants';
import { LoadLastReadEntriesRequest } from '@app/last-read/models/net/load-last-read-entries-request';
import { Comic } from '@app/library';
import { Store } from '@ngrx/store';
import { Subscription } from 'webstomp-client';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { selectLastReadListState } from '@app/last-read/selectors/last-read-list.selectors';
import {
  lastReadDateRemoved,
  lastReadDateUpdated,
  loadLastReadDates
} from '@app/last-read/actions/last-read-list.actions';
import { WebSocketService } from '@app/messaging';
import { LastRead } from '@app/last-read';

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
        if (!this.loaded) {
          this.store.dispatch(loadLastReadDates({ lastId: 0 }));
          this.store
            .select(selectLastReadListState)
            .subscribe(lastReadState => {
              if (!lastReadState.loading && !lastReadState.lastPayload) {
                let lastId = 0;
                lastReadState.entries.forEach(entry => {
                  if (entry.id > lastId) {
                    lastId = entry.id;
                  }
                });
                this.store.dispatch(loadLastReadDates({ lastId }));
              }
              if (!lastReadState.loading && lastReadState.lastPayload) {
                this.loaded = true;
              }
            });
        }
        if (!this.updateSubscription) {
          this.updateSubscription = this.webSocketService.subscribe<LastRead>(
            LAST_READ_UPDATE_TOPIC,
            entry => this.store.dispatch(lastReadDateUpdated({ entry }))
          );
        }
        if (!this.removeSubscription) {
          this.removeSubscription = this.webSocketService.subscribe<LastRead>(
            LAST_READ_REMOVE_TOPIC,
            entry => this.store.dispatch(lastReadDateRemoved({ entry }))
          );
        }
      }
      if (!state.started) {
        if (!!this.updateSubscription) {
          this.updateSubscription.unsubscribe();
          this.updateSubscription = null;
          this.loaded = false;
        }
        if (!!this.removeSubscription) {
          this.removeSubscription.unsubscribe();
          this.removeSubscription = null;
        }
      }
    });
  }

  loadEntries(args: { lastId: number }): Observable<any> {
    this.logger.debug('Service: loading last read entries:', args);
    return this.http.post(interpolate(LOAD_LAST_READ_ENTRIES_URL), {
      lastId: args.lastId
    } as LoadLastReadEntriesRequest);
  }

  setStatus(args: { comic: Comic; status: boolean }): Observable<any> {
    if (args.status) {
      this.logger.debug('Service: marking comic as read:', args);
      return this.http.post(
        interpolate(SET_COMIC_READ_STATUS_URL, { comicId: args.comic.id }),
        {}
      );
    } else {
      this.logger.debug('Service: marking comic as unread:', args);
      return this.http.delete(
        interpolate(CLEAR_COMIC_READ_STATUS_URL, { comicId: args.comic.id })
      );
    }
  }
}
