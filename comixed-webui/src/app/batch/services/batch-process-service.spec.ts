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
import { BATCH_PROCESS_LIST_UPDATE_TOPIC } from '@app/batch/batch-constants';
import { BATCH_PROCESS_1 } from '@app/batch/batch-fixtures';
import { Observable } from 'rxjs';

describe('BatchProcessService', () => {
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };
  const TEST_BATCH_PROCESS = BATCH_PROCESS_1;

  let service: BatchProcessService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockStore({ initialState })
      ]
    });
    service = TestBed.inject(BatchProcessService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when messaging starts', () => {
    let subscribeSpy: Mock;

    beforeEach(() => {
      subscribeSpy = vi
        .spyOn(service.webSocketService, 'subscribe')
        .mockImplementation((topic, callback) => {
          return Observable.create(() => {
            expect(topic).toStrictEqual(BATCH_PROCESS_LIST_UPDATE_TOPIC);
            callback(TEST_BATCH_PROCESS);
          });
        });
      store.setState({
        ...initialMessagingState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('should subscribe to batch process updates', () => {
      expect(subscribeSpy).toHaveBeenCalled();
    });
  });
});
