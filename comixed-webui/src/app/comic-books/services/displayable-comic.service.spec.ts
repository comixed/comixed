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

import { TestBed } from '@angular/core/testing';

import { DisplayableComicService } from './displayable-comic.service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { WebSocketService } from '@app/messaging';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { Subscription } from 'rxjs';
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
import { LoadComicsResponse } from '@app/comic-books/models/net/load-comics-response';
import { LoadComicsByFilterRequest } from '@app/comic-books/models/net/load-comics-by-filter-request';
import { LoadSelectedComicsRequest } from '@app/comic-books/models/net/load-selected-comics-request';
import { LoadComicsByIdRequest } from '@app/comic-books/models/net/load-comics-by-id-request';
import { LoadComicsForCollectionRequest } from '@app/comic-books/models/net/load-comics-for-collection-request';
import { LoadComicsByReadStateRequest } from '@app/comic-books/models/net/load-comics-by-read-state-request';
import { LoadComicsForListRequest } from '@app/comic-books/models/net/load-comics-for-list-request';
import { LoadDuplicateComicsRequest } from '@app/comic-books/models/net/load-duplicate-comics-request';
import {
  comicRemoved,
  comicUpdated
} from '@app/comic-books/actions/comic-list.actions';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

describe('DisplayableComicService', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const SELECTED_STATE = Math.random() > 0.5;
  const SCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const COLLECTION_TYPE = ComicTagType.TEAM;
  const COLLECTION_NAME = 'The Avengers';
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const PUBLISHER = COMIC_LIST[0].publisher;
  const SERIES = COMIC_LIST[0].series;
  const VOLUME = COMIC_LIST[0].volume;
  const PAGE_COUNT = 23;
  const IDS = COMIC_LIST.map(entry => entry.comicBookId);
  const TOTAL_COUNT = COMIC_LIST.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);
  const READING_LIST_ID = READING_LIST_3.id;
  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: DisplayableComicService;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const updateSubscription = jasmine.createSpyObj(['unsubscribe']);
  updateSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe()'
  );
  const removalSubscription = jasmine.createSpyObj(['unsubscribe']);
  removalSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe()'
  );
  let store: MockStore<any>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
            send: jasmine.createSpy('WebSocketService.send()'),
            requestResponse: jasmine.createSpy(
              'WebSocketService.requestResponse()'
            )
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DisplayableComicService);
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when messaging starts', () => {
    const COMIC_ADDED = COMIC_BOOK_1;
    const COMIC_REMOVED = COMIC_BOOK_2;

    beforeEach(() => {
      webSocketService.requestResponse.and.callFake(
        (message, body, destination, callback) => {
          callback(COMIC_ADDED);
          return {} as Subscription;
        }
      );
      webSocketService.subscribe
        .withArgs(COMIC_LIST_UPDATE_TOPIC, jasmine.anything())
        .and.callFake((destination, callback) => {
          callback(COMIC_ADDED);
          return {} as Subscription;
        });
      webSocketService.subscribe
        .withArgs(COMIC_LIST_REMOVAL_TOPIC, jasmine.anything())
        .and.callFake((destination, callback) => {
          callback(COMIC_REMOVED);
          return {} as Subscription;
        });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to the comic list update topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        COMIC_LIST_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('subscribes to the comic list removals topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        COMIC_LIST_REMOVAL_TOPIC,
        jasmine.anything()
      );
    });

    it('processes comic updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicUpdated({
          comic: {
            comicBookId: COMIC_ADDED.detail.comicId,
            comicDetailId: COMIC_ADDED.detail.id,
            archiveType: COMIC_ADDED.detail.archiveType,
            comicState: COMIC_ADDED.detail.comicState,
            unscraped: COMIC_ADDED.detail.unscraped,
            comicType: COMIC_ADDED.detail.comicType,
            publisher: COMIC_ADDED.detail.publisher,
            series: COMIC_ADDED.detail.series,
            volume: COMIC_ADDED.detail.volume,
            issueNumber: COMIC_ADDED.detail.issueNumber,
            sortableIssueNumber: COMIC_ADDED.detail.sortableIssueNumber,
            title: COMIC_ADDED.detail.title,
            pageCount: COMIC_ADDED.detail.pageCount,
            coverDate: COMIC_ADDED.detail.coverDate,
            yearPublished: COMIC_ADDED.detail.publishedYear,
            monthPublished: COMIC_ADDED.detail.publishedMonth,
            storeDate: COMIC_ADDED.detail.storeDate,
            addedDate: COMIC_ADDED.detail.addedDate
          } as DisplayableComic
        })
      );
    });

    it('processes comic removals', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicRemoved({
          comic: {
            comicBookId: COMIC_REMOVED.detail.comicId,
            comicDetailId: COMIC_REMOVED.detail.id,
            archiveType: COMIC_REMOVED.detail.archiveType,
            comicState: COMIC_REMOVED.detail.comicState,
            unscraped: COMIC_REMOVED.detail.unscraped,
            comicType: COMIC_REMOVED.detail.comicType,
            publisher: COMIC_REMOVED.detail.publisher,
            series: COMIC_REMOVED.detail.series,
            volume: COMIC_REMOVED.detail.volume,
            issueNumber: COMIC_REMOVED.detail.issueNumber,
            sortableIssueNumber: COMIC_REMOVED.detail.sortableIssueNumber,
            title: COMIC_REMOVED.detail.title,
            pageCount: COMIC_REMOVED.detail.pageCount,
            coverDate: COMIC_REMOVED.detail.coverDate,
            yearPublished: COMIC_REMOVED.detail.publishedYear,
            monthPublished: COMIC_REMOVED.detail.publishedMonth,
            storeDate: COMIC_REMOVED.detail.storeDate,
            addedDate: COMIC_REMOVED.detail.addedDate
          } as DisplayableComic
        })
      );
    });
  });

  describe('when messaging stops', () => {
    beforeEach(() => {
      service.updateSubscription = updateSubscription;
      service.removalSubscription = removalSubscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from the comic list update queue', () => {
      expect(updateSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the update subscription', () => {
      expect(service.updateSubscription).toBeNull();
    });

    it('unsubscribes from the comic list removal queue', () => {
      expect(removalSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the removal subscription', () => {
      expect(service.removalSubscription).toBeNull();
    });
  });

  it('can load comics by filter', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsByFilter({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        selected: false,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        pageCount: PAGE_COUNT,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_COMICS_BY_FILTER_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      coverYear: COVER_YEAR,
      coverMonth: COVER_MONTH,
      archiveType: ARCHIVE_TYPE,
      comicType: COMIC_TYPE,
      comicState: COMIC_STATE,
      unscrapedState: SCRAPED_STATE,
      searchText: SEARCH_TEXT,
      publisher: PUBLISHER,
      series: SERIES,
      volume: VOLUME,
      pageCount: PAGE_COUNT,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicsByFilterRequest);
    req.flush(serviceResponse);
  });

  it('can load selected comics', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsByFilter({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        selected: true,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        pageCount: PAGE_COUNT,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_SELECTED_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadSelectedComicsRequest);
    req.flush(serviceResponse);
  });

  it('can load comics by id', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      coverMonths: [],
      coverYears: [],
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsById({ ids: IDS })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_COMICS_BY_ID_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: IDS
    } as LoadComicsByIdRequest);
    req.flush(serviceResponse);
  });

  it('can load comics for a collection', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: COLLECTION_TYPE,
        tagValue: COLLECTION_NAME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMICS_FOR_COLLECTION_URL, {
        tagType: COLLECTION_TYPE,
        tagValue: COLLECTION_NAME
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicsForCollectionRequest);
    req.flush(serviceResponse);
  });

  it('can load unread comic details', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsByReadState({
        unreadOnly: true,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_UNREAD_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicsByReadStateRequest);
    req.flush(serviceResponse);
  });

  it('can load read comic details', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsByReadState({
        unreadOnly: false,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_READ_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicsByReadStateRequest);
    req.flush(serviceResponse);
  });

  it('can load comics for a reading list', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadComicsForReadingList({
        readingListId: READING_LIST_ID,
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMICS_FOR_READING_LIST_URL, {
        readingListId: READING_LIST_ID
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicsForListRequest);
    req.flush(serviceResponse);
  });

  it('can load duplicate comics', () => {
    const serviceResponse = {
      comics: COMIC_LIST,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicsResponse;
    service
      .loadDuplicateComics({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_DUPLICATE_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadDuplicateComicsRequest);
    req.flush(serviceResponse);
  });
});
