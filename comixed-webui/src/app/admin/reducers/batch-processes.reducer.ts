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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  batchProcessUpdateReceived,
  deleteCompletedBatchJobs,
  deleteCompletedBatchJobsFailure,
  deleteCompletedBatchJobsSuccess,
  loadBatchProcessList,
  loadBatchProcessListFailure,
  loadBatchProcessListSuccess,
  setBatchProcessDetail
} from '@app/admin/actions/batch-processes.actions';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';

export const BATCH_PROCESSES_FEATURE_KEY = 'batch_processes_state';

export interface BatchProcessesState {
  busy: boolean;
  entries: BatchProcessDetail[];
  detail: BatchProcessDetail;
}

export const initialState: BatchProcessesState = {
  busy: false,
  entries: [],
  detail: null
};

export const reducer = createReducer(
  initialState,
  on(loadBatchProcessList, state => ({ ...state, busy: true })),
  on(loadBatchProcessListSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.processes
  })),
  on(loadBatchProcessListFailure, state => ({ ...state, busy: false })),
  on(batchProcessUpdateReceived, (state, action) => {
    const entries = state.entries
      .filter(entry => entry.jobId !== action.update.jobId)
      .concat(action.update);
    return { ...state, entries };
  }),
  on(setBatchProcessDetail, (state, action) => ({
    ...state,
    detail: action.detail
  })),
  on(deleteCompletedBatchJobs, state => ({ ...state, busy: true })),
  on(deleteCompletedBatchJobsSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.processes
  })),
  on(deleteCompletedBatchJobsFailure, state => ({ ...state, busy: false }))
);

export const batchProcessFeature = createFeature({
  name: BATCH_PROCESSES_FEATURE_KEY,
  reducer
});
