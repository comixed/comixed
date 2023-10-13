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
import {
  COMIC_LIST_REMOVAL_TOPIC,
  COMIC_LIST_UPDATE_TOPIC
} from '@app/library/library.constants';
import { ComicBook } from '@app/comic-books/models/comic-book';
import {
  comicBookListRemovalReceived,
  comicBookListUpdateReceived
} from '@app/comic-books/actions/comic-book-list.actions';
import { Observable } from 'rxjs';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import { LoadComicDetailsRequest } from '@app/comic-books/models/net/load-comic-details-request';
import { LOAD_COMICS_URL } from '@app/comic-books/comic-books.constants';

@Injectable({
  providedIn: 'root'
})
export class ComicBookListService {
  updateSubscription: Subscription;
  removalSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {
    this.store.select(selectMessagingState).subscribe(state => {
      if (state.started && !this.updateSubscription) {
        this.logger.trace('Subscribing to comic list updates');
        this.updateSubscription = this.webSocketService.subscribe<ComicBook>(
          COMIC_LIST_UPDATE_TOPIC,
          comicBook => {
            this.logger.debug('Received comic list update:', comicBook);
            this.store.dispatch(
              comicBookListUpdateReceived({ comicDetail: comicBook.detail })
            );
          }
        );
        this.logger.trace('Subscribing to comic list removals');
        this.removalSubscription = this.webSocketService.subscribe<ComicBook>(
          COMIC_LIST_REMOVAL_TOPIC,
          comicBook => {
            this.logger.debug('Received comic removal update:', comicBook);
            this.store.dispatch(
              comicBookListRemovalReceived({ comicDetail: comicBook.detail })
            );
          }
        );
      }

      if (!state.started && !!this.updateSubscription) {
        this.logger.trace('Unsubscribing from comic list updates');
        this.updateSubscription.unsubscribe();
        this.updateSubscription = null;
      }
      if (!state.started && !!this.removalSubscription) {
        this.logger.trace('Unsubscribing from comic list removals');
        this.removalSubscription.unsubscribe();
        this.removalSubscription = null;
      }
    });
  }

  loadComicDetails(args: {
    pageSize: number;
    pageIndex: number;
    coverYear: number;
    coverMonth: number;
    archiveType: ArchiveType;
    comicType: ComicType;
    comicState: ComicState;
    readState: boolean;
    unscrapedState: boolean;
    searchText: string;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading comic details:', args);
    return this.http.post(interpolate(LOAD_COMICS_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      coverYear: args.coverYear,
      coverMonth: args.coverMonth,
      archiveType: args.archiveType,
      comicType: args.comicType,
      comicState: args.comicState,
      readState: args.readState,
      unscrapedState: args.unscrapedState,
      searchText: args.searchText,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadComicDetailsRequest);
  }
}
