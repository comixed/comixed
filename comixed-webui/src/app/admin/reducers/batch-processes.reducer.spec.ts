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

import {
  BatchProcessesState,
  initialState,
  reducer
} from './batch-processes.reducer';
import {
  BATCH_PROCESS_STATUS_1,
  BATCH_PROCESS_STATUS_2,
  BATCH_PROCESS_STATUS_3,
  BATCH_PROCESS_STATUS_4,
  BATCH_PROCESS_STATUS_5
} from '@app/admin/admin.fixtures';
import {
  batchProcessListLoaded,
  loadBatchProcessList,
  loadBatchProcessListFailed
} from '@app/admin/actions/batch-processes.actions';

describe('BatchProcesses Reducer', () => {
  const ENTRIES = [
    BATCH_PROCESS_STATUS_1,
    BATCH_PROCESS_STATUS_2,
    BATCH_PROCESS_STATUS_3,
    BATCH_PROCESS_STATUS_4,
    BATCH_PROCESS_STATUS_5
  ];

  let state: BatchProcessesState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading the list of processes', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadBatchProcessList());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the list of processes', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, entries: [] },
        batchProcessListLoaded({ processes: ENTRIES })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the list of entries', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('failure to load the list of processes', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadBatchProcessListFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
