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

import { LastReadService } from './last-read.service';
import {
  LAST_READ_1,
  LAST_READ_3,
  LAST_READ_4,
  LAST_READ_5
} from '@app/last-read/last-read.fixtures';
import { LoadLastReadEntriesResponse } from '@app/last-read/models/net/load-last-read-entries-response';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  LAST_READ_REMOVED_TOPIC,
  LAST_READ_UPDATED_TOPIC,
  LOAD_LAST_READ_ENTRIES_URL,
  SET_COMIC_READ_STATUS_URL
} from '@app/last-read/last-read.constants';
import { LoggerModule } from '@angular-ru/logger';
import { COMIC_4 } from '@app/comic-books/comic-books.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { WebSocketService } from '@app/messaging';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  lastReadDateRemoved,
  lastReadDateUpdated,
  loadLastReadDates
} from '@app/last-read/actions/last-read-list.actions';
import {
  initialState as initialLastReadListState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/last-read/reducers/last-read-list.reducer';
import { SetComicsReadRequest } from '@app/last-read/models/net/set-comics-read-request';
import { HttpResponse } from '@angular/common/http';

describe('LastReadService', () => {
  const ENTRIES = [LAST_READ_1, LAST_READ_3, LAST_READ_5];
  const LAST_PAYLOAD = Math.random() > 0.5;
  const LAST_ID = 23;
  const COMIC = COMIC_4;
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadListState
  };

  let service: LastReadService;
  let httpMock: HttpTestingController;
  let store: MockStore<any>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

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

    service = TestBed.inject(LastReadService);
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

  it('can load a batch of entries', () => {
    service.loadEntries({ lastId: LAST_ID }).subscribe(response =>
      expect(response).toEqual({
        entries: ENTRIES,
        lastPayload: LAST_PAYLOAD
      } as LoadLastReadEntriesResponse)
    );

    const req = httpMock.expectOne(
      interpolate(LOAD_LAST_READ_ENTRIES_URL, { lastId: LAST_ID })
    );
    expect(req.request.method).toEqual('GET');
    req.flush({
      entries: ENTRIES,
      lastPayload: LAST_PAYLOAD
    } as LoadLastReadEntriesResponse);
  });

  it('can set comics read', () => {
    const read = Math.random() > 0.5;
    service
      .setRead({ comics: [COMIC], read })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(SET_COMIC_READ_STATUS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [COMIC.id],
      read
    } as SetComicsReadRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });

  describe('when messaging starts', () => {
    describe('when entries are already loaded', () => {
      beforeEach(() => {
        service.loaded = false;
        service.updateSubscription = {} as any;
        service.removeSubscription = {} as any;
        store.setState({
          ...initialState,
          [MESSAGING_FEATURE_KEY]: {
            ...initialMessagingState,
            started: true
          }
        });
      });

      it('does not resubscribe', () => {
        expect(webSocketService.subscribe).not.toHaveBeenCalled();
      });
    });

    describe('when no entries are loaded', () => {
      const ENTRY = LAST_READ_4;

      beforeEach(() => {
        service.loaded = false;
        service.updateSubscription = null;
        service.removeSubscription = null;
        webSocketService.subscribe
          .withArgs(LAST_READ_UPDATED_TOPIC, jasmine.anything())
          .and.callFake((topic, callback) => {
            callback(ENTRY);
            return {
              unsubscribe: jasmine.createSpy('Subscription.unsubscribe()')
            } as any;
          });
        webSocketService.subscribe
          .withArgs(LAST_READ_REMOVED_TOPIC, jasmine.anything())
          .and.callFake((topic, callback) => {
            callback(ENTRY);
            return {
              unsubscribe: jasmine.createSpy('Subscription.unsubscribe()')
            } as any;
          });
        store.setState({
          ...initialState,
          [MESSAGING_FEATURE_KEY]: {
            ...initialMessagingState,
            started: true
          },
          [LAST_READ_LIST_FEATURE_KEY]: {
            ...initialLastReadListState,
            loading: false,
            lastPayload: true
          }
        });
      });

      it('fires an action to load the first batch of last read dates', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadLastReadDates({ lastId: 0 })
        );
      });

      it('subscribes to updates', () => {
        expect(service.updateSubscription).not.toBeNull();
      });

      it('processes updates', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          lastReadDateUpdated({ entry: ENTRY })
        );
      });

      it('subscribes to removals', () => {
        expect(service.removeSubscription).not.toBeNull();
      });

      it('processes removals', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          lastReadDateRemoved({ entry: ENTRY })
        );
      });

      describe('when a payload is received', () => {
        beforeEach(() => {
          store.setState({
            ...initialState,
            [LAST_READ_LIST_FEATURE_KEY]: {
              ...initialLastReadListState,
              lastPayload: false,
              loading: false,
              entries: [
                { id: LAST_ID } as any,
                { id: LAST_ID - 1 } as any,
                { id: LAST_ID - 2 } as any,
                { id: LAST_ID - 3 } as any
              ]
            }
          });
        });

        it('fires an action to load the next batch', () => {
          expect(store.dispatch).toHaveBeenCalledWith(
            loadLastReadDates({ lastId: LAST_ID })
          );
        });
      });

      describe('when the last payload is received', () => {
        beforeEach(() => {
          store.setState({
            ...initialState,
            [LAST_READ_LIST_FEATURE_KEY]: {
              ...initialLastReadListState,
              lastPayload: true
            }
          });
        });

        it('sets the loaded flag', () => {
          expect(service.loaded).toBeTrue();
        });
      });
    });

    describe('when entries are already loaded', () => {
      beforeEach(() => {
        service.loaded = true;
        store.setState({
          ...initialState,
          [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
        });
      });

      it('does not start loading entries', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });
});
