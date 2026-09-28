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
  batchProcessListAdapter,
  batchProcessListReducer,
  BatchProcessListState,
  initialBatchProcessListState
} from './batch-process-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { BATCH_PROCESS_1, BATCH_PROCESS_2 } from '@app/batch/batch-fixtures';
import { BatchProcessListActions } from '@app/batch/actions/batch-process-list.actions';

describe('BatchProcessList Reducer', () => {
  const TEST_BATCH_PROCESS = BATCH_PROCESS_1;
  const TEST_EXISTING_PROCESS = BATCH_PROCESS_2;
  const TEST_BATCH_PROCESS_LIST = [TEST_BATCH_PROCESS, TEST_EXISTING_PROCESS];

  let state: BatchProcessListState;

  beforeEach(() => {
    state = {
      ...initialBatchProcessListState
    };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = batchProcessListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should contain no batch processes', () => {
      expect(
        batchProcessListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });
  });

  describe('loading', () => {
    beforeEach(() => {
      state = batchProcessListReducer(
        { ...state, busy: false },
        BatchProcessListActions.load()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = batchProcessListReducer(
          batchProcessListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          BatchProcessListActions.loadSuccess({
            entries: TEST_BATCH_PROCESS_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of processes', () => {
        expect(
          batchProcessListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_BATCH_PROCESS_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = batchProcessListReducer(
          batchProcessListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          BatchProcessListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('receiving an update', () => {
    beforeEach(() => {
      state = batchProcessListReducer(
        batchProcessListAdapter.setAll([TEST_EXISTING_PROCESS], { ...state }),
        BatchProcessListActions.update({ update: TEST_BATCH_PROCESS })
      );
    });

    it('should update the list of processes', () => {
      expect(
        batchProcessListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([TEST_BATCH_PROCESS, TEST_EXISTING_PROCESS]);
    });
  });

  describe('deleting completed processes', () => {
    beforeEach(() => {
      state = batchProcessListReducer(
        { ...state, busy: false },
        BatchProcessListActions.deleteCompleted()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = batchProcessListReducer(
          batchProcessListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          BatchProcessListActions.deleteCompletedSuccess({
            entries: TEST_BATCH_PROCESS_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of processes', () => {
        expect(
          batchProcessListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_BATCH_PROCESS_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = batchProcessListReducer(
          batchProcessListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          BatchProcessListActions.deleteCompletedFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
