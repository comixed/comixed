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
import { LibraryService } from './library.service';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4
} from '@app/comic-books/comic-books.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  CONVERT_COMICS_URL,
  EDIT_MULTIPLE_COMICS_URL,
  LOAD_LIBRARY_STATE_URL,
  PURGE_LIBRARY_URL,
  REMOTE_LIBRARY_STATE_TOPIC,
  RESCAN_COMICS_URL,
  SET_READ_STATE_URL,
  START_LIBRARY_CONSOLIDATION_URL,
  UPDATE_METADATA_URL
} from '@app/library/library.constants';
import { HttpResponse } from '@angular/common/http';
import { SetComicReadRequest } from '@app/library/models/net/set-comic-read-request';
import { ConsolidateLibraryRequest } from '@app/library/models/net/consolidate-library-request';
import { RescanComicsRequest } from '@app/library/models/net/rescan-comics-request';
import { UpdateMetadataRequest } from '@app/library/models/net/update-metadata-request';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ConvertComicsRequest } from '@app/library/models/net/convert-comics-request';
import { PurgeLibraryRequest } from '@app/library/models/net/purge-library-request';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { EditMultipleComicsRequest } from '@app/library/models/net/edit-multiple-comics-request';
import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';
import { Subscription } from 'webstomp-client';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { libraryStateLoaded } from '@app/library/actions/library.actions';

describe('LibraryService', () => {
  const COMIC_BOOK = COMIC_DETAIL_1;
  const COMIC_BOOKS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4
  ];
  const READ = Math.random() > 0.5;
  const ARCHIVE_TYPE = ArchiveType.CBZ;
  const RENAME_PAGES = Math.random() > 0.5;
  const DELETE_PAGES = Math.random() > 0.5;
  const IDS = [203, 204, 205];
  const COMIC_DETAILS: EditMultipleComics = {
    publisher: 'The Publisher',
    series: 'The Series',
    volume: '2022',
    issueNumber: '17b',
    imprint: 'The Imprint'
  };
  const LIBRARY_STATE = {} as RemoteLibraryState;
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: LibraryService;
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

    service = TestBed.inject(LibraryService);
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

  it('can retrieve the remove library state', () => {
    service
      .loadLibraryState()
      .subscribe(response => expect(response).toEqual(LIBRARY_STATE));

    const req = httpMock.expectOne(interpolate(LOAD_LIBRARY_STATE_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(LIBRARY_STATE);
  });

  it('can set the read state for comics', () => {
    const serviceResponse = new HttpResponse({ status: 200 });
    service
      .setRead({ comicBooks: COMIC_BOOKS, read: READ })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(SET_READ_STATE_URL));
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      ids: COMIC_BOOKS.map(comic => comic.comicId),
      read: READ
    } as SetComicReadRequest);
    req.flush(serviceResponse);
  });

  it('can start library consolidation', () => {
    service
      .startLibraryConsolidation()
      .subscribe(response => expect(response).toEqual(COMIC_BOOKS));

    const req = httpMock.expectOne(
      interpolate(START_LIBRARY_CONSOLIDATION_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      deletePhysicalFiles: false
    } as ConsolidateLibraryRequest);
  });

  it('can start rescanning comics', () => {
    service
      .rescanComics({ comicBooks: COMIC_BOOKS })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(RESCAN_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMIC_BOOKS.map(comic => comic.comicId)
    } as RescanComicsRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can start updating metadata', () => {
    service
      .updateMetadata({ ids: IDS })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(UPDATE_METADATA_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: IDS
    } as UpdateMetadataRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can convert comics', () => {
    service
      .convertComics({
        comicBooks: COMIC_BOOKS,
        archiveType: ARCHIVE_TYPE,
        renamePages: RENAME_PAGES,
        deletePages: DELETE_PAGES
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(CONVERT_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMIC_BOOKS.map(comic => comic.comicId),
      archiveType: ARCHIVE_TYPE,
      deletePages: DELETE_PAGES,
      renamePages: RENAME_PAGES
    } as ConvertComicsRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can purge the library', () => {
    service
      .purgeLibrary({ ids: IDS })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(PURGE_LIBRARY_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids: IDS } as PurgeLibraryRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can edit multiple comics', () => {
    service
      .editMultipleComics({
        comicBooks: COMIC_BOOKS,
        details: COMIC_DETAILS
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(EDIT_MULTIPLE_COMICS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: COMIC_BOOKS.map(comic => comic.comicId),
      publisher: COMIC_DETAILS.publisher,
      series: COMIC_DETAILS.series,
      volume: COMIC_DETAILS.volume,
      issueNumber: COMIC_DETAILS.issueNumber,
      imprint: COMIC_DETAILS.imprint
    } as EditMultipleComicsRequest);
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
      expect(topic).toEqual(REMOTE_LIBRARY_STATE_TOPIC);
    });

    describe('when updates are received', () => {
      beforeEach(() => {
        subscription(LIBRARY_STATE);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          libraryStateLoaded({ state: LIBRARY_STATE })
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
});
