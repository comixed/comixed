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

import { BlockedHashService } from './blocked-hash.service';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_2,
  BLOCKED_HASH_3,
  BLOCKED_HASH_4,
  BLOCKED_HASH_5,
  BLOCKED_PAGE_FILE,
  PAGE_2
} from '@app/comic-pages/comic-pages.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  BLOCKED_HASH_LIST_REMOVAL_TOPIC,
  BLOCKED_HASH_LIST_UPDATE_TOPIC,
  DELETE_BLOCKED_PAGES_URL,
  DOWNLOAD_BLOCKED_PAGE_FILE_URL,
  LOAD_ALL_BLOCKED_PAGES_URL,
  LOAD_BLOCKED_PAGE_BY_HASH_URL,
  MARK_PAGES_WITH_HASH_URL,
  REMOVE_BLOCKED_STATE_URL,
  REMOVE_SELECTED_HASHES_BLOCKED_STATE_URL,
  SAVE_BLOCKED_PAGE_URL,
  SET_BLOCKED_STATE_URL,
  SET_SELECTED_HASHES_BLOCKED_STATE_URL,
  UNMARK_PAGES_WITH_HASH_URL,
  UPLOAD_BLOCKED_PAGE_FILE_URL
} from '@app/comic-pages/comic-pages.constants';
import { interpolate } from '@app/core';
import { Subscription } from 'rxjs';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { DeleteBlockedPagesRequest } from '@app/comic-pages/models/net/delete-blocked-pages-request';
import { SetBlockedStateRequest } from '@app/comic-pages/models/net/set-blocked-state-request';
import { MarkPagesWithHashRequest } from '@app/comic-pages/models/net/mark-pages-with-hash-request';
import { UnmarkPagesWithHashRequest } from '@app/comic-pages/models/net/unmark-pages-with-hash-request';
import {
  blockedHashRemoved,
  blockedHashUpdated
} from '@app/comic-pages/actions/blocked-hashes.actions';

describe('BlockedHashService', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const ENTRY = BLOCKED_HASH_4;
  const UPDATED = BLOCKED_HASH_2;
  const REMOVED = BLOCKED_HASH_3;
  const PAGE = PAGE_2;
  const DOWNLOADED_FILE = BLOCKED_PAGE_FILE;
  const UPLOADED_FILE = new File([], 'testing');
  const BLOCKED_PAGES = [BLOCKED_HASH_1, BLOCKED_HASH_2, BLOCKED_HASH_3];
  const DELETED = Math.random() > 0.5;
  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: BlockedHashService;
  let httpMock: HttpTestingController;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const updateSubscription = jasmine.createSpyObj(['unsubscribe']);
  updateSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe(updates)'
  );
  const removeSubscription = jasmine.createSpyObj(['unsubscribe']);
  removeSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe(removals)'
  );
  let store: MockStore<any>;

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

    service = TestBed.inject(BlockedHashService);
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

  describe('when messaging starts', () => {
    beforeEach(() => {
      service.updateSubscription = null;
      service.removalSubscription = null;
      webSocketService.subscribe
        .withArgs(BLOCKED_HASH_LIST_UPDATE_TOPIC, jasmine.anything())
        .and.callFake((topic, callback) => {
          callback(UPDATED);
          return {} as Subscription;
        });
      webSocketService.subscribe
        .withArgs(BLOCKED_HASH_LIST_REMOVAL_TOPIC, jasmine.anything())
        .and.callFake((topic, callback) => {
          callback(REMOVED);
          return {} as Subscription;
        });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to the blocked page list update topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        BLOCKED_HASH_LIST_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('subscribes to the blocked page list removal topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        BLOCKED_HASH_LIST_REMOVAL_TOPIC,
        jasmine.anything()
      );
    });

    it('processes blocked list updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        blockedHashUpdated({ entry: UPDATED })
      );
    });

    it('processed blocked list removals', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        blockedHashRemoved({ entry: REMOVED })
      );
    });
  });

  describe('when messaging stops', () => {
    beforeEach(() => {
      service.updateSubscription = updateSubscription;
      service.removalSubscription = removeSubscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from the blocked list update queue', () => {
      expect(updateSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the blocked page list update subscription', () => {
      expect(service.updateSubscription).toBeNull();
    });

    it('unsubscribes from the blocked list removal queue', () => {
      expect(removeSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the blocked page list removal subscription', () => {
      expect(service.removalSubscription).toBeNull();
    });
  });

  it('can load all blocked pages', () => {
    service.loadAll().subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(interpolate(LOAD_ALL_BLOCKED_PAGES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(ENTRIES);
  });

  it('can load a blocked page by hash', () => {
    service
      .loadByHash({ hash: ENTRY.hash })
      .subscribe(response => expect(response).toEqual(ENTRY));

    const req = httpMock.expectOne(
      interpolate(LOAD_BLOCKED_PAGE_BY_HASH_URL, { hash: ENTRY.hash })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(ENTRY);
  });

  it('can save a blocked page', () => {
    service
      .save({ entry: ENTRY })
      .subscribe(response => expect(response).toEqual(ENTRY));

    const req = httpMock.expectOne(
      interpolate(SAVE_BLOCKED_PAGE_URL, { hash: ENTRY.hash })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(ENTRY);
    req.flush(ENTRY);
  });

  it('can block a page', () => {
    service
      .setBlockedState({ hashes: [PAGE.hash], blocked: true })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(SET_BLOCKED_STATE_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      hashes: [PAGE.hash]
    } as SetBlockedStateRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can unblock a page', () => {
    service
      .setBlockedState({ hashes: [PAGE.hash], blocked: false })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(REMOVE_BLOCKED_STATE_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      hashes: [PAGE.hash]
    } as SetBlockedStateRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can block selected hashes', () => {
    service
      .setBlockedStateForSelections({ blocked: true })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(SET_SELECTED_HASHES_BLOCKED_STATE_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can unblock selected hashes', () => {
    service
      .setBlockedStateForSelections({ blocked: false })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(REMOVE_SELECTED_HASHES_BLOCKED_STATE_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can download a blocked page file', () => {
    service
      .downloadFile()
      .subscribe(response => expect(response).toEqual(DOWNLOADED_FILE));

    const req = httpMock.expectOne(interpolate(DOWNLOAD_BLOCKED_PAGE_FILE_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(DOWNLOADED_FILE);
  });

  it('can upload a blocked page file', () => {
    service
      .uploadFile({ file: UPLOADED_FILE })
      .subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(interpolate(UPLOAD_BLOCKED_PAGE_FILE_URL));
    expect(req.request.method).toEqual('POST');
    expect((req.request.body as FormData).get('file')).toEqual(UPLOADED_FILE);
    req.flush(ENTRIES);
  });

  it('can delete blocked pages', () => {
    service
      .deleteEntries({ entries: ENTRIES })
      .subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(interpolate(DELETE_BLOCKED_PAGES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      hashes: ENTRIES.map(entry => entry.hash)
    } as DeleteBlockedPagesRequest);
    req.flush(ENTRIES);
  });

  it('can mark pages with hashes', () => {
    const serviceResponse = new HttpResponse({ status: 200 });
    service
      .markPagesWithHash({
        hashes: BLOCKED_PAGES.map(page => page.hash),
        deleted: true
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(MARK_PAGES_WITH_HASH_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      hashes: BLOCKED_PAGES.map(page => page.hash)
    } as MarkPagesWithHashRequest);
    req.flush(serviceResponse);
  });

  it('can unmark pages with hashes', () => {
    const serviceResponse = new HttpResponse({ status: 200 });
    service
      .markPagesWithHash({
        hashes: BLOCKED_PAGES.map(page => page.hash),
        deleted: false
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(UNMARK_PAGES_WITH_HASH_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      hashes: BLOCKED_PAGES.map(page => page.hash)
    } as UnmarkPagesWithHashRequest);
    req.flush(serviceResponse);
  });
});
