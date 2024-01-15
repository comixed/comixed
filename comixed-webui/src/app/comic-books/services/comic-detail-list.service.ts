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
import { Observable } from 'rxjs';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import { LoadComicDetailsRequest } from '@app/comic-books/models/net/load-comic-details-request';
import {
  LOAD_COMIC_DETAILS_BY_ID_URL,
  LOAD_COMIC_DETAILS_FOR_COLLECTION_URL,
  LOAD_COMIC_DETAILS_FOR_READING_LIST_URL,
  LOAD_COMIC_DETAILS_URL,
  LOAD_UNREAD_COMIC_DETAILS_URL
} from '@app/comic-books/comic-books.constants';
import { LoadComicDetailsByIdRequest } from '@app/comic-books/models/net/load-comic-details-by-id-request';
import {
  comicDetailRemoved,
  comicDetailUpdated
} from '@app/comic-books/actions/comic-details-list.actions';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { LoadComicDetailsForCollectionRequest } from '@app/comic-books/models/net/load-comic-details-for-collection-request';
import { LoadUnreadComicDetailsRequest } from '@app/comic-books/models/net/load-unread-comic-details-request';
import { LoadComicDetailsForReadingListRequest } from '@app/comic-books/models/net/load-comic-details-for-reading-list-request';

@Injectable({
  providedIn: 'root'
})
export class ComicDetailListService {
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
          comic => {
            this.logger.debug('Received comic list update:', comic);
            this.store.dispatch(
              comicDetailUpdated({ comicDetail: comic.detail })
            );
          }
        );
        this.logger.trace('Subscribing to comic list removals');
        this.removalSubscription = this.webSocketService.subscribe<ComicBook>(
          COMIC_LIST_REMOVAL_TOPIC,
          comicBook => {
            this.logger.debug('Received comic removal update:', comicBook);
            this.store.dispatch(
              comicDetailRemoved({ comicDetail: comicBook.detail })
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
    unscrapedState: boolean;
    searchText: string;
    publisher: string;
    series: string;
    volume: string;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading comic details:', args);
    return this.http.post(interpolate(LOAD_COMIC_DETAILS_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      coverYear: args.coverYear,
      coverMonth: args.coverMonth,
      archiveType: args.archiveType,
      comicType: args.comicType,
      comicState: args.comicState,
      unscrapedState: args.unscrapedState,
      searchText: args.searchText,
      publisher: args.publisher,
      series: args.series,
      volume: args.volume,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadComicDetailsRequest);
  }

  loadComicDetailsById(args: { ids: number[] }): Observable<any> {
    this.logger.debug('Loading comic details by id:', args);
    return this.http.post(interpolate(LOAD_COMIC_DETAILS_BY_ID_URL), {
      comicBookIds: args.ids
    } as LoadComicDetailsByIdRequest);
  }

  loadComicDetailsForCollection(args: {
    pageSize: number;
    pageIndex: number;
    tagType: TagType;
    tagValue: string;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading comic details for collection:', args);
    return this.http.post(interpolate(LOAD_COMIC_DETAILS_FOR_COLLECTION_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      tagType: args.tagType,
      tagValue: args.tagValue,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadComicDetailsForCollectionRequest);
  }

  loadUnreadComicDetails(args: {
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading unread comic details:', args);
    return this.http.post(interpolate(LOAD_UNREAD_COMIC_DETAILS_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadUnreadComicDetailsRequest);
  }

  loadComicDetailsForReadingList(args: {
    readingListId: number;
    sortDirection: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
  }): Observable<any> {
    this.logger.debug('Loading comic details for reading list:', args);
    return this.http.post(
      interpolate(LOAD_COMIC_DETAILS_FOR_READING_LIST_URL, {
        readingListId: args.readingListId
      }),
      {
        pageSize: args.pageSize,
        pageIndex: args.pageIndex,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadComicDetailsForReadingListRequest
    );
  }
}
