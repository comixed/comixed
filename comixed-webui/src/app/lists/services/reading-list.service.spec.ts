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
import { ReadingListService } from './reading-list.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';
import { interpolate } from '@app/core';
import {
  ADD_COMICS_TO_READING_LIST_URL,
  DELETE_READING_LISTS_URL,
  DOWNLOAD_READING_LIST_URL,
  LOAD_READING_LIST_URL,
  LOAD_READING_LISTS_URL,
  READING_LIST_REMOVAL_TOPIC,
  READING_LISTS_UPDATES_TOPIC,
  REMOVE_COMICS_FROM_READING_LIST_URL,
  SAVE_READING_LIST,
  UPDATE_READING_LIST,
  UPLOAD_READING_LIST_URL
} from '@app/lists/lists.constants';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { COMIC_1 } from '@app/comic-books/comic-books.fixtures';
import { AddComicsToReadingListRequest } from '@app/lists/models/net/add-comics-to-reading-list-request';
import { RemoveComicsFromReadingListRequest } from '@app/lists/models/net/remove-comics-from-reading-list-request';
import { DownloadDocument } from '@app/core/models/download-document';
import { HttpResponse } from '@angular/common/http';
import { DeleteReadingListsRequest } from '@app/lists/models/net/delete-reading-lists-request';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Subscription as WebstompSubscription } from 'webstomp-client';
import {
  readingListRemoved,
  readingListUpdate
} from '@app/lists/actions/reading-lists.actions';
import { WebSocketService } from '@app/messaging';

describe('ReadingListService', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];
  const READING_LIST = READING_LISTS[0];
  const COMIC = COMIC_1;
  const DOWNLOAD_DOCUMENT = {
    filename: 'filename',
    content: 'content',
    mediaType: 'text/csv'
  } as DownloadDocument;
  const UPLOADED_FILE = new File([], 'testing');

  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: ReadingListService;
  let httpMock: HttpTestingController;
  let store: MockStore<any>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const updateSubscription = jasmine.createSpyObj(['unsubscribe']);
  updateSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe(updates)'
  );
  const removalSubscription = jasmine.createSpyObj(['unsubscribe']);
  removalSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe(removals)'
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            subscribe: jasmine.createSpy('WebSocketService.subscribe()')
          }
        }
      ]
    });

    service = TestBed.inject(ReadingListService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the reading lists for the current user', () => {
    service
      .loadReadingLists()
      .subscribe(response => expect(response).toEqual(READING_LISTS));

    const req = httpMock.expectOne(interpolate(LOAD_READING_LISTS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(READING_LISTS);
  });

  it('can load a single reading list', () => {
    service
      .loadOne({ id: READING_LIST.id })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(LOAD_READING_LIST_URL, {
        id: READING_LIST.id
      })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(READING_LIST);
  });

  it('can save a new reading list', () => {
    service
      .save({ list: { ...READING_LIST, id: null } })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(interpolate(SAVE_READING_LIST));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ...READING_LIST, id: null });
    req.flush(READING_LIST);
  });

  it('can update an existing reading list', () => {
    service
      .save({ list: READING_LIST })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(UPDATE_READING_LIST, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(READING_LIST);
    req.flush(READING_LIST);
  });

  it('can add comics to a reading list', () => {
    service
      .addComics({
        list: READING_LIST,
        comics: [COMIC]
      })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(ADD_COMICS_TO_READING_LIST_URL, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [COMIC.id]
    } as AddComicsToReadingListRequest);
    req.flush(READING_LIST);
  });

  it('can remove comics from a reading list', () => {
    service
      .removeComics({
        list: READING_LIST,
        comics: [COMIC]
      })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(REMOVE_COMICS_FROM_READING_LIST_URL, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [COMIC.id]
    } as RemoveComicsFromReadingListRequest);
    req.flush(READING_LIST);
  });

  it('can download a reading list', () => {
    service
      .downloadFile({ list: READING_LIST })
      .subscribe(response => expect(response).toEqual(DOWNLOAD_DOCUMENT));

    const req = httpMock.expectOne(
      interpolate(DOWNLOAD_READING_LIST_URL, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(DOWNLOAD_DOCUMENT);
  });

  it('can upload a reading list', () => {
    service
      .uploadFile({ file: UPLOADED_FILE })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(UPLOAD_READING_LIST_URL));
    expect(req.request.method).toEqual('POST');
    expect((req.request.body as FormData).get('file')).toEqual(UPLOADED_FILE);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can delete reading lists', () => {
    service
      .deleteReadingLists({ lists: READING_LISTS })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(DELETE_READING_LISTS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: READING_LISTS.map(list => list.id)
    } as DeleteReadingListsRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  describe('when messaging is started', () => {
    beforeEach(() => {
      service.readingListUpdateSubscription = null;
      service.readingListRemovalSubscription = null;
      webSocketService.subscribe
        .withArgs(READING_LISTS_UPDATES_TOPIC, jasmine.anything())
        .and.callFake((topic, callback) => {
          callback(READING_LIST);
          return {} as WebstompSubscription;
        });
      webSocketService.subscribe
        .withArgs(READING_LIST_REMOVAL_TOPIC, jasmine.anything())
        .and.callFake((topic, callback) => {
          callback(READING_LIST);
          return {} as WebstompSubscription;
        });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to reading list update topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        READING_LISTS_UPDATES_TOPIC,
        jasmine.anything()
      );
    });

    it('subscribes to reading list removal topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        READING_LIST_REMOVAL_TOPIC,
        jasmine.anything()
      );
    });

    it('processes reading list updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        readingListUpdate({ list: READING_LIST })
      );
    });

    it('processed reading list removals', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        readingListRemoved({ list: READING_LIST })
      );
    });
  });

  describe('when messaging is stopped', () => {
    beforeEach(() => {
      service.readingListUpdateSubscription = updateSubscription;
      service.readingListRemovalSubscription = removalSubscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from the reading list update queue', () => {
      expect(updateSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the reading page list update subscription', () => {
      expect(service.readingListUpdateSubscription).toBeNull();
    });

    it('unsubscribes from the reading list removal queue', () => {
      expect(removalSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the reading page list removal subscription', () => {
      expect(service.readingListRemovalSubscription).toBeNull();
    });
  });
});
