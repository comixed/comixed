/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import BatchProcessService from './batch-process-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Mock } from 'vitest';
import {
  BATCH_PROCESS_LIST_UPDATE_TOPIC,
  DELETE_COMPLETED_BATCH_PROCESSES_URL,
  LOAD_BATCH_PROCESS_LIST_URL
} from '@app/batch/batch-constants';
import { BATCH_PROCESS_1, BATCH_PROCESS_2 } from '@app/batch/batch-fixtures';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { interpolate } from '@app/app-functions';
import { BatchProcessListActions } from '@app/batch/actions/batch-process-list.actions';
import { Subscription } from 'rxjs';

describe('BatchProcessService', () => {
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };
  const TEST_BATCH_PROCESS = BATCH_PROCESS_1;
  const TEST_OTHER_BATCH_PROCESS = BATCH_PROCESS_2;
  const TEST_BATCH_PROCESS_LIST = [
    TEST_BATCH_PROCESS,
    TEST_OTHER_BATCH_PROCESS
  ];

  let service: BatchProcessService;
  let store: MockStore;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockStore({ initialState })
      ]
    });
    service = TestBed.inject(BatchProcessService);
    store = TestBed.inject(MockStore);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when messaging starts', () => {
    let subscribeSpy: Mock;
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(service.store, 'dispatch');
      subscribeSpy = vi
        .spyOn(service.webSocketService, 'subscribe')
        .mockImplementation((topic, callback) => {
          expect(topic).toStrictEqual(BATCH_PROCESS_LIST_UPDATE_TOPIC);
          callback(TEST_OTHER_BATCH_PROCESS);
          return new Subscription();
        });
      store.setState({
        ...initialMessagingState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('should subscribe to batch process updates', () => {
      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should process updates', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        BatchProcessListActions.update({ update: TEST_OTHER_BATCH_PROCESS })
      );
    });

    it('should load the batch process list', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(BatchProcessListActions.load());
    });
  });

  it('should load the current list of batch processes', () => {
    const serverResponse = TEST_BATCH_PROCESS_LIST;

    service.loadBatchProcessList().subscribe({
      next: response => expect(response).toStrictEqual(serverResponse)
    });

    const req = httpController.expectOne(
      interpolate(LOAD_BATCH_PROCESS_LIST_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should delete completed processes', () => {
    const serverResponse = TEST_BATCH_PROCESS_LIST;

    service.deleteCompletedBatchProcesses().subscribe({
      next: response => expect(response).toStrictEqual(serverResponse)
    });

    const req = httpController.expectOne(
      interpolate(DELETE_COMPLETED_BATCH_PROCESSES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(serverResponse);
    httpController.verify();
  });
});
