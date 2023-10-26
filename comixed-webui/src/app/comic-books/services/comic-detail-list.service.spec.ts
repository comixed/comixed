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

import { TestBed } from '@angular/core/testing';

import { ComicDetailListService } from './comic-detail-list.service';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { Subscription } from 'webstomp-client';
import {
  COMIC_LIST_REMOVAL_TOPIC,
  COMIC_LIST_UPDATE_TOPIC
} from '@app/library/library.constants';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import { LoadComicDetailsRequest } from '@app/comic-books/models/net/load-comic-details-request';
import {
  LOAD_COMIC_DETAILS_BY_ID_URL,
  LOAD_COMIC_DETAILS_FOR_COLLECTION_URL,
  LOAD_COMIC_DETAILS_URL
} from '@app/comic-books/comic-books.constants';
import { LoadComicDetailsResponse } from '@app/comic-books/models/net/load-comic-details-response';
import { LoadComicDetailsByIdRequest } from '@app/comic-books/models/net/load-comic-details-by-id-request';
import {
  comicDetailRemoved,
  comicDetailUpdated
} from '@app/comic-books/actions/comic-details-list.actions';
import { TagType } from '@app/collections/models/comic-collection.enum';
import { LoadComicDetailsForCollectionRequest } from '@app/comic-books/models/net/load-comic-details-for-collection-request';

describe('ComicDetailListService', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const READ_STATE = Math.random() > 0.5;
  const SCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const COLLECTION_TYPE = TagType.TEAMS;
  const COLLECTION_NAME = 'The Avengers';
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const PUBLISHER = COMIC_DETAILS[0].publisher;
  const SERIES = COMIC_DETAILS[0].series;
  const VOLUME = COMIC_DETAILS[0].volume;
  const IDS = COMIC_DETAILS.map(entry => entry.comicId);
  const TOTAL_COUNT = COMIC_DETAILS.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);
  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: ComicDetailListService;
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
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
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
        }
      ]
    });

    service = TestBed.inject(ComicDetailListService);
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
        comicDetailUpdated({ comicDetail: COMIC_ADDED.detail })
      );
    });

    it('processes comic removals', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicDetailRemoved({ comicDetail: COMIC_REMOVED.detail })
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

  it('can load a page worth of comic details', () => {
    const serviceResponse = {
      comicDetails: COMIC_DETAILS,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicDetailsResponse;
    service
      .loadComicDetails({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        readState: READ_STATE,
        unscrapedState: SCRAPED_STATE,
        searchText: SEARCH_TEXT,
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_COMIC_DETAILS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      coverYear: COVER_YEAR,
      coverMonth: COVER_MONTH,
      archiveType: ARCHIVE_TYPE,
      comicType: COMIC_TYPE,
      comicState: COMIC_STATE,
      readState: READ_STATE,
      unscrapedState: SCRAPED_STATE,
      searchText: SEARCH_TEXT,
      publisher: PUBLISHER,
      series: SERIES,
      volume: VOLUME,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicDetailsRequest);
    req.flush(serviceResponse);
  });

  it('can load comic details by id', () => {
    const serviceResponse = {
      comicDetails: COMIC_DETAILS,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicDetailsResponse;
    service
      .loadComicDetailsById({ ids: IDS })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_COMIC_DETAILS_BY_ID_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      comicBookIds: IDS
    } as LoadComicDetailsByIdRequest);
    req.flush(serviceResponse);
  });

  it('can load comic details for a collection', () => {
    const serviceResponse = {
      comicDetails: COMIC_DETAILS,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    } as LoadComicDetailsResponse;
    service
      .loadComicDetailsForCollection({
        pageSize: PAGE_SIZE,
        pageIndex: PAGE_INDEX,
        tagType: COLLECTION_TYPE,
        tagValue: COLLECTION_NAME,
        sortBy: SORT_BY,
        sortDirection: SORT_DIRECTION
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_COMIC_DETAILS_FOR_COLLECTION_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      pageSize: PAGE_SIZE,
      pageIndex: PAGE_INDEX,
      tagType: COLLECTION_TYPE,
      tagValue: COLLECTION_NAME,
      sortBy: SORT_BY,
      sortDirection: SORT_DIRECTION
    } as LoadComicDetailsForCollectionRequest);
    req.flush(serviceResponse);
  });
});
