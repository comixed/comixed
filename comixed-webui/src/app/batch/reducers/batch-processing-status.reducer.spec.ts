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

import {
  batchProcessingStatusAdapter,
  batchProcessingStatusReducer,
  BatchProcessingStatusState,
  initialBatchProcessingStatusState
} from '../reducers/batch-processing-status.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { BatchProcessingStatusActions } from '@app/batch/actions/batch-processing-status.actions';
import {
  BATCH_PROCESSING_STATUS_1,
  BATCH_PROCESSING_STATUS_2
} from '@app/batch/batch-fixtures';

describe('BatchProcessingStatus Reducer', () => {
  const TEST_STATUS = BATCH_PROCESSING_STATUS_1;
  const TEST_EXISTING_STATUS = BATCH_PROCESSING_STATUS_2;

  let state: BatchProcessingStatusState;

  beforeEach(() => {
    state = { ...initialBatchProcessingStatusState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = batchProcessingStatusReducer({ ...state }, {} as Action<string>);
    });

    it('should have no progress', () => {
      expect(
        batchProcessingStatusAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });
  });

  describe('when a new status is received', () => {
    beforeEach(() => {
      state = batchProcessingStatusReducer(
        batchProcessingStatusAdapter.setAll([TEST_EXISTING_STATUS], {
          ...state,
          lastUpdated: 0
        }),
        BatchProcessingStatusActions.updateReceived({ update: TEST_STATUS })
      );
    });

    it('should modify the last updated time', () => {
      expect(state.lastUpdated).not.toBe(0);
    });

    it('should add the batch to the list', () => {
      expect(
        batchProcessingStatusAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([TEST_STATUS, TEST_EXISTING_STATUS]);
    });
  });

  describe('when an updated status is received', () => {
    const TEST_UPDATED_STATUS = {
      ...TEST_EXISTING_STATUS,
      processed: TEST_EXISTING_STATUS.processed + 1
    };

    beforeEach(() => {
      state = batchProcessingStatusReducer(
        batchProcessingStatusAdapter.setAll([TEST_EXISTING_STATUS], {
          ...state,
          lastUpdated: 0
        }),
        BatchProcessingStatusActions.updateReceived({
          update: TEST_UPDATED_STATUS
        })
      );
    });

    it('should modify the last updated time', () => {
      expect(state.lastUpdated).not.toBe(0);
    });

    it('should add the batch to the list', () => {
      expect(
        batchProcessingStatusAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([TEST_UPDATED_STATUS]);
    });
  });
});
