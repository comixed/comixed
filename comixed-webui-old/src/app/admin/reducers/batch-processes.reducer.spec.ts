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
  BATCH_PROCESS_DETAIL_1,
  BATCH_PROCESS_DETAIL_2
} from '@app/admin/admin.fixtures';
import {
  batchProcessUpdateReceived,
  deleteCompletedBatchJobs,
  deleteCompletedBatchJobsFailure,
  deleteCompletedBatchJobsSuccess,
  deleteSelectedBatchJobs,
  deleteSelectedBatchJobsFailure,
  deleteSelectedBatchJobsSuccess,
  loadBatchProcessList,
  loadBatchProcessListFailure,
  loadBatchProcessListSuccess,
  setBatchProcessDetail
} from '@app/admin/actions/batch-processes.actions';

describe('BatchProcesses Reducer', () => {
  const ENTRIES = [BATCH_PROCESS_DETAIL_1, BATCH_PROCESS_DETAIL_2];
  const SELECTED_IDS = ENTRIES.map(entry => entry.jobId);
  const DETAIL = ENTRIES[0];

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

    it('has no detail', () => {
      expect(state.detail).toBeNull();
    });
  });

  describe('loading the list of processes', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadBatchProcessList());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success ', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          loadBatchProcessListSuccess({ processes: ENTRIES })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the list of entries', () => {
        expect(state.entries).toEqual(ENTRIES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          loadBatchProcessListFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('receiving a batch process update with a new entry', () => {
    const DETAIL = BATCH_PROCESS_DETAIL_1;

    beforeEach(() => {
      state = reducer(
        { ...state, entries: [BATCH_PROCESS_DETAIL_2] },
        batchProcessUpdateReceived({ update: DETAIL })
      );
    });

    it('adds the new entry', () => {
      expect(state.entries).toContain(DETAIL);
    });
  });

  describe('receiving a batch process update with an updated entry', () => {
    const DETAIL = BATCH_PROCESS_DETAIL_1;

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          entries: [
            {
              ...DETAIL,
              running: !DETAIL.running,
              jobName: DETAIL.jobName.substring(1)
            }
          ]
        },
        batchProcessUpdateReceived({ update: DETAIL })
      );
    });

    it('adds the new entry', () => {
      expect(state.entries).toContain(DETAIL);
    });
  });

  describe('setting the current batch process detail', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, detail: null },
        setBatchProcessDetail({ detail: DETAIL })
      );
    });

    it('sets the detail', () => {
      expect(state.detail).toBe(DETAIL);
    });
  });

  describe('clearing the current batch process detail', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, detail: null },
        setBatchProcessDetail({ detail: null })
      );
    });

    it('clears the detail', () => {
      expect(state.detail).toBeNull();
    });
  });

  describe('deleting completed batch jobs', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, deleteCompletedBatchJobs());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          deleteCompletedBatchJobsSuccess({ processes: ENTRIES })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the list of remaining batch jobs', () => {
        expect(state.entries).toEqual(ENTRIES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          deleteCompletedBatchJobsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('deleting selected batch jobs', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        deleteSelectedBatchJobs({ jobIds: SELECTED_IDS })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          deleteSelectedBatchJobsSuccess({ processes: ENTRIES })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the list of remaining batch jobs', () => {
        expect(state.entries).toEqual(ENTRIES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          deleteSelectedBatchJobsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
