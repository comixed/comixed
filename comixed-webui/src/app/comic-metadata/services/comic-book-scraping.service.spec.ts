/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { ComicBookScrapingService } from './comic-book-scraping.service';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5,
  COMIC_DETAIL_1
} from '@app/comic-books/comic-books.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  CLEAR_METADATA_CACHE_URL,
  LOAD_SCRAPING_ISSUE_URL,
  LOAD_SCRAPING_VOLUMES_URL,
  REMOVE_MULTI_BOOK_COMIC_URL,
  SCRAPE_MULTI_BOOK_COMIC_URL,
  SCRAPE_SINGLE_BOOK_COMIC_URL,
  START_METADATA_UPDATE_PROCESS_URL,
  START_MULTI_BOOK_SCRAPING_URL
} from '@app/library/library.constants';
import { LoadIssueMetadataRequest } from '@app/comic-metadata/models/net/load-issue-metadata-request';
import { ScrapeSingleBookComicRequest } from '@app/comic-metadata/models/net/scrape-single-book-comic-request';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';
import { HttpResponse } from '@angular/common/http';
import { StartMetadataUpdateProcessRequest } from '@app/comic-metadata/models/net/start-metadata-update-process-request';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Subscription } from 'webstomp-client';
import {
  FETCH_ISSUES_FOR_VOLUME,
  METADATA_UPDATE_PROCESS_UPDATE_TOPIC
} from '@app/comic-metadata/comic-metadata.constants';
import { metadataUpdateProcessStatusUpdated } from '@app/comic-metadata/actions/metadata-update-process.actions';
import { MetadataUpdateProcessUpdate } from '@app/comic-metadata/models/net/metadata-update-process-update';
import { FetchIssuesForSeriesRequest } from '@app/comic-metadata/models/net/fetch-issues-for-series-request';
import { LoadVolumeMetadataRequest } from '@app/comic-metadata/models/net/load-volume-metadata-request';
import { ScrapeMultiBookComicResponse } from '@app/comic-metadata/models/net/scrape-multi-book-comic-response';
import { StartMultiBookScrapingResponse } from '@app/comic-metadata/models/net/start-multi-book-scraping-response';
import { RemoveMultiBookComicResponse } from '@app/comic-metadata/models/net/remove-multi-book-comic-response';

describe('ComicBookScrapingService', () => {
  const SERIES = 'The Series';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const VOLUME_ID = SCRAPING_VOLUME_1.id;
  const ISSUE_NUMBER = '27';
  const COMIC_BOOK = COMIC_BOOK_4;
  const COMIC_DETAIL = COMIC_DETAIL_1;
  const COMIC_BOOKS = [
    COMIC_BOOK_1,
    COMIC_BOOK_2,
    COMIC_BOOK_3,
    COMIC_BOOK_4,
    COMIC_BOOK_5
  ];
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const SCRAPING_VOLUME = SCRAPING_VOLUME_1;
  const PROCESS_STATE = {
    active: Math.random() > 0.5,
    totalComics: 7171,
    completedComics: 233
  } as MetadataUpdateProcessUpdate;
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: ComicBookScrapingService;
  let httpMock: HttpTestingController;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let store: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            send: jasmine.createSpy('WebSocketService.send()'),
            subscribe: jasmine.createSpy('WebSocketService.subscribe()')
          }
        }
      ]
    });

    service = TestBed.inject(ComicBookScrapingService);
    httpMock = TestBed.inject(HttpTestingController);
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load scraping volumes', () => {
    service
      .loadScrapingVolumes({
        metadataSource: METADATA_SOURCE,
        series: SERIES,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(VOLUMES));

    const req = httpMock.expectOne(
      interpolate(LOAD_SCRAPING_VOLUMES_URL, { sourceId: METADATA_SOURCE.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      series: SERIES,
      maxRecords: MAXIMUM_RECORDS,
      skipCache: SKIP_CACHE
    } as LoadVolumeMetadataRequest);
  });

  it('can load a scraping issue', () => {
    service
      .loadScrapingIssue({
        metadataSource: METADATA_SOURCE,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(SCRAPING_ISSUE));

    const req = httpMock.expectOne(
      interpolate(LOAD_SCRAPING_ISSUE_URL, {
        sourceId: METADATA_SOURCE.id,
        volumeId: VOLUME_ID,
        issueNumber: ISSUE_NUMBER
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      skipCache: SKIP_CACHE
    } as LoadIssueMetadataRequest);
    req.flush(SCRAPING_ISSUE);
  });

  it('can scrape a comic book as part of single-book scraping', () => {
    service
      .scrapeSingleBookComic({
        metadataSource: METADATA_SOURCE,
        issueId: SCRAPING_ISSUE.id,
        comicBook: COMIC_BOOK,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(COMIC_BOOK));

    const req = httpMock.expectOne(
      interpolate(SCRAPE_SINGLE_BOOK_COMIC_URL, {
        sourceId: METADATA_SOURCE.id,
        comicId: COMIC_BOOK.id
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      issueId: SCRAPING_ISSUE.id,
      skipCache: SKIP_CACHE
    } as ScrapeSingleBookComicRequest);
    req.flush(COMIC_BOOK);
  });

  it('can start multi-book scraping', () => {
    const serverResponse = {
      comicBooks: COMIC_BOOKS
    } as StartMultiBookScrapingResponse;
    service
      .startMultiBookScraping()
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(interpolate(START_MULTI_BOOK_SCRAPING_URL));
    expect(req.request.method).toEqual('PUT');
    req.flush(serverResponse);
  });

  it('can remove a comic from multi-book scraping', () => {
    const serverResponse = {
      comicBooks: COMIC_BOOKS
    } as RemoveMultiBookComicResponse;
    service
      .removeMultiBookComic({ comicBook: COMIC_BOOK })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(REMOVE_MULTI_BOOK_COMIC_URL, {
        comicBookId: COMIC_BOOK.id
      })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(serverResponse);
  });

  it('can scrape a comic book as part of multi-book scraping', () => {
    const serverResponse = {
      comicBooks: COMIC_BOOKS
    } as ScrapeMultiBookComicResponse;
    service
      .scrapeMultiBookComic({
        metadataSource: METADATA_SOURCE,
        issueId: SCRAPING_ISSUE.id,
        comicBook: COMIC_BOOK,
        skipCache: SKIP_CACHE
      })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(
      interpolate(SCRAPE_MULTI_BOOK_COMIC_URL, {
        sourceId: METADATA_SOURCE.id,
        comicBookId: COMIC_BOOK.id
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      issueId: SCRAPING_ISSUE.id,
      skipCache: SKIP_CACHE
    } as ScrapeSingleBookComicRequest);
    req.flush(serverResponse);
  });

  it('can clear the metadata cache', () => {
    service
      .clearCache()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(CLEAR_METADATA_CACHE_URL));
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can start the batch metadata update process', () => {
    service
      .startMetadataUpdateProcess({ skipCache: SKIP_CACHE })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(START_METADATA_UPDATE_PROCESS_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      skipCache: SKIP_CACHE
    } as StartMetadataUpdateProcessRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      service.subscription = null;
      webSocketService.subscribe.and.callFake((topicUsed, callback) => {
        topic = topicUsed;
        subscription = callback;
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to user updates', () => {
      expect(topic).toEqual(METADATA_UPDATE_PROCESS_UPDATE_TOPIC);
    });

    describe('when updates are received', () => {
      beforeEach(() => {
        subscription(PROCESS_STATE);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          metadataUpdateProcessStatusUpdated({
            active: PROCESS_STATE.active,
            completedComics: PROCESS_STATE.completedComics,
            totalComics: PROCESS_STATE.totalComics
          })
        );
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      service.subscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(service.subscription).toBeNull();
    });
  });

  it('can fetch issues for a series', () => {
    const serviceResponse = new HttpResponse({ status: 200 });
    service
      .fetchIssuesForSeries({
        source: METADATA_SOURCE,
        volume: SCRAPING_VOLUME
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(FETCH_ISSUES_FOR_VOLUME, { id: METADATA_SOURCE.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      volumeId: SCRAPING_VOLUME.id
    } as FetchIssuesForSeriesRequest);
    req.flush(serviceResponse);
  });
});
