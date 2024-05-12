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
import { ProcessComicsService } from './process-comics.service';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { Frame, Subscription } from 'webstomp-client';
import { PROCESS_COMIC_BOOKS_TOPIC } from '@app/app.constants';
import { ProcessComicBooksStatus } from '@app/models/messages/process-comic-books-status';

describe('ProcessComicsService', () => {
  const ADD_COUNT = Math.abs(Math.floor(Math.random() * 1000));
  const PROCESSING_COUNT = Math.abs(Math.floor(Math.random() * 1000));
  const IMPORT_COUNT = ADD_COUNT + PROCESSING_COUNT;

  const initialState = {
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let service: ProcessComicsService;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const processComicsSubscription = jasmine.createSpyObj(['unsubscribe']);
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
            send: jasmine.createSpy('WebSocketService.send()')
          }
        }
      ]
    });
    service = TestBed.inject(ProcessComicsService);

    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    processComicsSubscription.unsubscribe = jasmine.createSpy(
      'processComicsSubscription.unsubscribe()'
    );
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when messaging starts', () => {
    const PROCESSING_MESSAGE = new Frame(
      'scan type',
      {},
      JSON.stringify({
        stepName: 'step-name',
        total: ADD_COUNT,
        processed: PROCESSING_COUNT
      } as ProcessComicBooksStatus)
    );

    beforeEach(() => {
      webSocketService.subscribe.and.callFake((topic, callback) => {
        callback(PROCESSING_MESSAGE);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to the processing comic books updates', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        PROCESS_COMIC_BOOKS_TOPIC,
        jasmine.anything()
      );
    });
  });

  describe('when messaging stops', () => {
    beforeEach(() => {
      service.processComicsSubscription = processComicsSubscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from process comics updates', () => {
      expect(processComicsSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the process comics subscription', () => {
      expect(service.processComicsSubscription).toBeNull();
    });
  });
});
