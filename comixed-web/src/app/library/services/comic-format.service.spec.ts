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
import { ComicFormatService } from './comic-format.service';
import { FORMAT_1, FORMAT_3 } from '@app/library/library.fixtures';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/logger';
import { Subscription } from 'webstomp-client';
import {
  COMIC_FORMAT_UPDATE_TOPIC,
  LOAD_COMIC_FORMATS_MESSAGE
} from '@app/library/library.constants';
import { comicFormatAdded } from '@app/library/actions/comic-format.actions';

describe('ComicFormatService', () => {
  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: ComicFormatService;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const subscription = jasmine.createSpyObj(['unsubscribe']);
  subscription.unsubscribe = jasmine.createSpy('Subscription.unsubscribe()');
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
        }
      ]
    });

    service = TestBed.inject(ComicFormatService);
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
    const FORMAT1 = FORMAT_1;
    const FORMAT2 = FORMAT_3;

    beforeEach(() => {
      webSocketService.requestResponse.and.callFake(
        (message, body, destination, callback) => {
          callback(FORMAT1);
          return {} as Subscription;
        }
      );
      webSocketService.subscribe.and.callFake((topic, callback) => {
        callback(FORMAT2);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('requests the initial load of comic formats', () => {
      expect(webSocketService.requestResponse).toHaveBeenCalledWith(
        LOAD_COMIC_FORMATS_MESSAGE,
        '',
        COMIC_FORMAT_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('processes formats received on initial load', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicFormatAdded({ format: FORMAT1 })
      );
    });

    it('subscribes to the comic formats topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        COMIC_FORMAT_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('processes messages received on the subscription', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicFormatAdded({ format: FORMAT2 })
      );
    });
  });

  describe('when messaging stops', () => {
    beforeEach(() => {
      service.subscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from the update comic format topic', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription', () => {
      expect(service.subscription).toBeNull();
    });
  });
});
