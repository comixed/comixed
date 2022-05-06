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

import { ComicBookListService } from './comic-book-list.service';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3
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
import {
  comicBookListRemovalReceived,
  comicBookListUpdateReceived
} from '@app/comic-books/actions/comic-book-list.actions';

describe('ComicBookListService', () => {
  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: ComicBookListService;
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

    service = TestBed.inject(ComicBookListService);
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
      webSocketService.requestResponse.and.callFake(
        (message, body, destination, callback) => {
          callback(COMIC_BOOK_1);
          return {} as Subscription;
        }
      );
      webSocketService.subscribe
        .withArgs(COMIC_LIST_UPDATE_TOPIC, jasmine.anything())
        .and.callFake((destination, callback) => {
          callback(COMIC_BOOK_2);
          return {} as Subscription;
        });
      webSocketService.subscribe
        .withArgs(COMIC_LIST_REMOVAL_TOPIC, jasmine.anything())
        .and.callFake((destination, callback) => {
          callback(COMIC_BOOK_3);
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
        comicBookListUpdateReceived({ comicBook: COMIC_BOOK_2 })
      );
    });

    it('processes comic removals', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicBookListRemovalReceived({ comicBook: COMIC_BOOK_3 })
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
});
