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
import { TaskCountService } from './task-count.service';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TASK_COUNT_TOPIC } from '@app/app.constants';
import { TaskCountMessage } from '@app/models/net/task-count-message';
import { setServerStatus } from '@app/actions/server-status.actions';
import { Frame, Subscription } from 'webstomp-client';
import { WebSocketService } from '@app/messaging';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';

describe('TaskCountService', () => {
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: TaskCountService;
  let store: MockStore<any>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  const subscription = jasmine.createSpyObj(['unsubscribe']);
  subscription.unsubscribe = jasmine.createSpy('Subscription.unsubscribe()');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
            unsubscribe: jasmine.createSpy('WebSocketService.unsubscribe()')
          }
        }
      ]
    });

    service = TestBed.inject(TaskCountService);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('messaging has started', () => {
    const COUNT = 17;
    const MESSAGE = new Frame(
      'MESSAGE',
      {},
      JSON.stringify({ count: COUNT } as TaskCountMessage)
    );

    beforeEach(() => {
      webSocketService.subscribe.and.callFake((topic, callback) => {
        callback(MESSAGE);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: {
          ...initialMessagingState,
          started: true
        }
      });
    });

    it('subscribes to the task topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        TASK_COUNT_TOPIC,
        jasmine.anything()
      );
    });

    it('fires an action on update', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setServerStatus({ count: COUNT })
      );
    });
  });

  describe('messaging stops', () => {
    beforeEach(() => {
      service.subscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: {
          ...initialMessagingState,
          started: false
        }
      });
    });

    it('unsubscribes from the topic', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
