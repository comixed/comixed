/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LibraryPluginService } from './library-plugin.service';
import {
  LIBRARY_PLUGIN_1,
  LIBRARY_PLUGIN_4,
  PLUGIN_LIST
} from '@app/library-plugins/library-plugins.fixtures';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  CREATE_PLUGIN_URL,
  DELETE_PLUGIN_URL,
  LIBRARY_PLUGIN_LIST_UPDATES,
  LOAD_ALL_PLUGINS_URL,
  RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL,
  RUN_LIBRARY_PLUGIN_ON_SELECTED_COMIC_BOOKS_URL,
  UPDATE_PLUGIN_URL
} from '@app/library-plugins/library-plugins.constants';
import { CreatePluginRequest } from '@app/library-plugins/models/net/create-plugin-request';
import { UpdatePluginRequest } from '@app/library-plugins/models/net/update-plugin-request';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { COMIC_BOOK_2 } from '@app/comic-books/comic-books.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Subscription } from 'rxjs';
import { WebSocketService } from '@app/messaging';
import { loadLibraryPluginsSuccess } from '@app/library-plugins/actions/library-plugin.actions';

describe('LibraryPluginService', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;
  const COMIC_BOOK = COMIC_BOOK_2;
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: LibraryPluginService;
  let httpMock: HttpTestingController;
  let store: MockStore;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: WebSocketService,
          useValue: {
            send: jasmine.createSpy('WebSocketService.send()'),
            subscribe: jasmine.createSpy('WebSocketService.subscribe()')
          }
        }
      ]
    });

    service = TestBed.inject(LibraryPluginService);
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

  it('can load the list of plugins', () => {
    service
      .loadAll()
      .subscribe(response => expect(response).toEqual(PLUGIN_LIST));

    const req = httpMock.expectOne(interpolate(LOAD_ALL_PLUGINS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(PLUGIN_LIST);
  });

  it('can create a new plugin', () => {
    service
      .createPlugin({
        language: PLUGIN.language,
        filename: PLUGIN.filename
      })
      .subscribe(response => expect(response).toEqual(PLUGIN));

    const req = httpMock.expectOne(interpolate(CREATE_PLUGIN_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      language: PLUGIN.language,
      filename: PLUGIN.filename
    } as CreatePluginRequest);
    req.flush(PLUGIN);
  });

  it('can update a plugin', () => {
    service
      .updatePlugin({
        plugin: PLUGIN
      })
      .subscribe(response => expect(response).toEqual(PLUGIN));

    const properties = {};
    PLUGIN.properties.forEach(entry => (properties[entry.name] = entry.value));
    const req = httpMock.expectOne(
      interpolate(UPDATE_PLUGIN_URL, { pluginId: PLUGIN.libraryPluginId })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      adminOnly: PLUGIN.adminOnly,
      properties
    } as UpdatePluginRequest);
    req.flush(PLUGIN);
  });

  it('can delete a plugin', () => {
    service
      .deletePlugin({
        plugin: PLUGIN
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(DELETE_PLUGIN_URL, { pluginId: PLUGIN.libraryPluginId })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can run a plugin against a single comic book', () => {
    service
      .runLibraryPluginOnOneComicBook({
        plugin: PLUGIN,
        comicBookId: COMIC_BOOK.comicBookId
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL, {
        pluginId: PLUGIN.libraryPluginId,
        comicBookId: COMIC_BOOK.comicBookId
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can run a plugin against all selected comic books', () => {
    service
      .runLibraryPluginOnSelectedComicBooks({
        plugin: PLUGIN
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(RUN_LIBRARY_PLUGIN_ON_SELECTED_COMIC_BOOKS_URL, {
        pluginId: PLUGIN.libraryPluginId
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      service.pluginSubscription = null;
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

    it('subscribes to plugin updates', () => {
      expect(topic).toEqual(LIBRARY_PLUGIN_LIST_UPDATES);
    });

    describe('when updates are received', () => {
      const APP_MESSAGE = 'This is the sample message.';
      const PLUGINS = [LIBRARY_PLUGIN_1];

      beforeEach(() => {
        subscription(PLUGINS);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadLibraryPluginsSuccess({ plugins: PLUGINS })
        );
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      service.pluginSubscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(service.pluginSubscription).toBeNull();
    });
  });
});
