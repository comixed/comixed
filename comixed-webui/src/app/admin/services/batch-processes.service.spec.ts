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
import { BatchProcessesService } from './batch-processes.service';
import {
  BATCH_PROCESS_DETAIL_1,
  BATCH_PROCESS_DETAIL_2
} from '@app/admin/admin.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  BATCH_PROCESS_LIST_UPDATE_TOPIC,
  DELETE_COMPLETED_BATCH_JOBS_URL,
  GET_ALL_BATCH_PROCESSES_URL
} from '@app/admin/admin.constants';
import { Subscription } from 'webstomp-client';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { batchProcessUpdateReceived } from '@app/admin/actions/batch-processes.actions';
import { WebSocketService } from '@app/messaging';

describe('BatchProcessesService', () => {
  const ENTRIES = [BATCH_PROCESS_DETAIL_1, BATCH_PROCESS_DETAIL_2];
  const DETAIL = ENTRIES[0];
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: BatchProcessesService;
  let httpMock: HttpTestingController;
  let store: MockStore;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

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

    service = TestBed.inject(BatchProcessesService);
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

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      service.messagingSubscription = null;
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
      expect(topic).toEqual(BATCH_PROCESS_LIST_UPDATE_TOPIC);
    });

    describe('when updates are received', () => {
      beforeEach(() => {
        subscription(DETAIL);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          batchProcessUpdateReceived({ update: DETAIL })
        );
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      service.processListUpdateSubscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(service.processListUpdateSubscription).toBeNull();
    });
  });

  it('can load the list of batch processes', () => {
    service.getAll().subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(interpolate(GET_ALL_BATCH_PROCESSES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(ENTRIES);
  });

  it('deleted completed batch jobs', () => {
    service
      .deleteCompletedBatchJobs()
      .subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(
      interpolate(DELETE_COMPLETED_BATCH_JOBS_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(ENTRIES);
  });
});
