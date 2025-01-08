/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { Store } from '@ngrx/store';
import { WebSocketService } from '@app/messaging';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { ComicBook } from '@app/comic-books/models/comic-book';
import {
  COMIC_LIST_REMOVAL_TOPIC,
  COMIC_LIST_UPDATE_TOPIC
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import {
  LOAD_COMICS_BY_FILTER_URL,
  LOAD_COMICS_BY_ID_URL,
  LOAD_COMICS_FOR_COLLECTION_URL,
  LOAD_COMICS_FOR_READING_LIST_URL,
  LOAD_DUPLICATE_COMICS_URL,
  LOAD_READ_COMICS_URL,
  LOAD_SELECTED_COMICS_URL,
  LOAD_UNREAD_COMICS_URL
} from '@app/comic-books/comic-books.constants';
import { LoadComicsByFilterRequest } from '@app/comic-books/models/net/load-comics-by-filter-request';
import { LoadSelectedComicsRequest } from '@app/comic-books/models/net/load-selected-comics-request';
import { LoadComicsByIdRequest } from '@app/comic-books/models/net/load-comics-by-id-request';
import { LoadComicsForCollectionRequest } from '@app/comic-books/models/net/load-comics-for-collection-request';
import { LoadComicsByReadStateRequest } from '@app/comic-books/models/net/load-comics-by-read-state-request';
import { LoadComicsForListRequest } from '@app/comic-books/models/net/load-comics-for-list-request';
import { LoadDuplicateComicsRequest } from '@app/comic-books/models/net/load-duplicate-comics-request';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { DisplayableComic } from '@app/comic-books/model/displayable-comic';
import {
  comicRemoved,
  comicUpdated
} from '@app/comic-books/actions/comic-list.actions';

@Injectable({
  providedIn: 'root'
})
export class DisplayableComicService {
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
              comicUpdated({
                comic: this.doConvertToDisplayableComic(comic.detail)
              })
            );
          }
        );
        this.logger.trace('Subscribing to comic list removals');
        this.removalSubscription = this.webSocketService.subscribe<ComicBook>(
          COMIC_LIST_REMOVAL_TOPIC,
          comic => {
            this.logger.debug('Received comic removal update:', comic);
            this.store.dispatch(
              comicRemoved({
                comic: this.doConvertToDisplayableComic(comic.detail)
              })
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

  loadComicsByFilter(args: {
    pageSize: number;
    pageIndex: number;
    coverYear: number;
    coverMonth: number;
    archiveType: ArchiveType;
    comicType: ComicType;
    comicState: ComicState;
    selected: boolean;
    unscrapedState: boolean;
    searchText: string;
    publisher: string;
    series: string;
    volume: string;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    if (args.selected) {
      this.logger.trace('Loading selected comics:', args);
      return this.http.post(interpolate(LOAD_SELECTED_COMICS_URL), {
        pageSize: args.pageSize,
        pageIndex: args.pageIndex,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadSelectedComicsRequest);
    } else {
      this.logger.trace('Loading comics by filter:', args);
      return this.http.post(interpolate(LOAD_COMICS_BY_FILTER_URL), {
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
      } as LoadComicsByFilterRequest);
    }
  }

  loadComicsById(args: { ids: number[] }): Observable<any> {
    this.logger.debug('Loading comics by id:', args);
    return this.http.post(interpolate(LOAD_COMICS_BY_ID_URL), {
      ids: args.ids
    } as LoadComicsByIdRequest);
  }

  loadComicsForCollection(args: {
    pageSize: number;
    pageIndex: number;
    tagType: TagType;
    tagValue: string;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    this.logger.debug('Loading comics for collection:', args);
    return this.http.post(interpolate(LOAD_COMICS_FOR_COLLECTION_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      tagType: args.tagType,
      tagValue: args.tagValue,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadComicsForCollectionRequest);
  }

  loadComicsByReadState(args: {
    unreadOnly: boolean;
    pageSize: number;
    pageIndex: number;
    sortBy: string;
    sortDirection: string;
  }): Observable<any> {
    if (args.unreadOnly) {
      this.logger.debug('Loading unread comics:', args);
      return this.http.post(interpolate(LOAD_UNREAD_COMICS_URL), {
        pageSize: args.pageSize,
        pageIndex: args.pageIndex,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadComicsByReadStateRequest);
    } else {
      this.logger.debug('Loading read comics:', args);
      return this.http.post(interpolate(LOAD_READ_COMICS_URL), {
        pageSize: args.pageSize,
        pageIndex: args.pageIndex,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadComicsByReadStateRequest);
    }
  }

  loadComicsForReadingList(args: {
    readingListId: number;
    sortDirection: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
  }): Observable<any> {
    this.logger.debug('Loading comics for reading list:', args);
    return this.http.post(
      interpolate(LOAD_COMICS_FOR_READING_LIST_URL, {
        readingListId: args.readingListId
      }),
      {
        pageSize: args.pageSize,
        pageIndex: args.pageIndex,
        sortBy: args.sortBy,
        sortDirection: args.sortDirection
      } as LoadComicsForListRequest
    );
  }

  loadDuplicateComics(args: {
    sortDirection: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
  }): Observable<any> {
    this.logger.debug(
      'Loading duplicate comic book details for reading list:',
      args
    );
    return this.http.post(interpolate(LOAD_DUPLICATE_COMICS_URL), {
      pageSize: args.pageSize,
      pageIndex: args.pageIndex,
      sortBy: args.sortBy,
      sortDirection: args.sortDirection
    } as LoadDuplicateComicsRequest);
  }

  private doConvertToDisplayableComic(detail: ComicDetail): DisplayableComic {
    return {
      comicBookId: detail.comicId,
      comicDetailId: detail.id,
      archiveType: detail.archiveType,
      comicState: detail.comicState,
      unscraped: detail.unscraped,
      comicType: detail.comicType,
      publisher: detail.publisher,
      series: detail.series,
      volume: detail.volume,
      issueNumber: detail.issueNumber,
      sortableIssueNumber: detail.sortableIssueNumber,
      title: detail.title,
      pageCount: detail.pageCount,
      coverDate: detail.coverDate,
      yearPublished: detail.publishedYear,
      monthPublished: detail.publishedMonth,
      storeDate: detail.storeDate,
      addedDate: detail.addedDate
    } as DisplayableComic;
  }
}
