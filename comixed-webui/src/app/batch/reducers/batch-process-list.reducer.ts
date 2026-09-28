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

import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { BatchProcessListActions } from '../actions/batch-process-list.actions';
import { BatchProcess } from '@app/batch/models/batch-process';

export const BATCH_PROCESS_LIST_FEATURE_KEY = 'batch_process_list_state';

export interface BatchProcessListState extends EntityState<BatchProcess> {
  busy: boolean;
}

export const batchProcessListAdaptor: EntityAdapter<BatchProcess> =
  createEntityAdapter<BatchProcess>({
    selectId: process => process.jobId,
    sortComparer: (left, right) => left.startTime - right.startTime
  });

export const initialBatchProcessListState: BatchProcessListState =
  batchProcessListAdaptor.getInitialState({
    busy: false
  });

export const batchProcessListReducer = createReducer(
  initialBatchProcessListState,
  on(BatchProcessListActions.load, state => ({ ...state, busy: true })),
  on(BatchProcessListActions.loadSuccess, (state, action) => {
    return batchProcessListAdaptor.setAll(action.entries, {
      ...state,
      busy: false
    });
  }),
  on(BatchProcessListActions.loadFailure, state => ({ ...state, busy: false })),
  on(BatchProcessListActions.update, (state, action) =>
    batchProcessListAdaptor.upsertOne(action.update, { ...state })
  )
);

export const batchProcessListFeature = createFeature({
  name: BATCH_PROCESS_LIST_FEATURE_KEY,
  reducer: batchProcessListReducer
});
