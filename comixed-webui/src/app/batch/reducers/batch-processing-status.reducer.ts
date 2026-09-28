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
import { BatchProcessingStatus } from '@app/batch/models/batch-processing-status';
import { BatchProcessingStatusActions } from '@app/batch/actions/batch-processing-status.actions';

export const BATCH_PROCESSING_STATUS_FEATURE_KEY =
  'batch_processing_status_state';

export interface BatchProcessingStatusState extends EntityState<BatchProcessingStatus> {
  lastUpdated: number;
}

export const batchProcessingStatusAdapter: EntityAdapter<BatchProcessingStatus> =
  createEntityAdapter<BatchProcessingStatus>({
    selectId: process => process.jobId,
    sortComparer: (left, right) => left.jobId - right.jobId
  });

export const initialBatchProcessingStatusState: BatchProcessingStatusState =
  batchProcessingStatusAdapter.getInitialState({
    lastUpdated: 0
  });

export const batchProcessingStatusReducer = createReducer(
  initialBatchProcessingStatusState,
  on(BatchProcessingStatusActions.updateReceived, (state, action) => {
    return batchProcessingStatusAdapter.upsertOne(action.update, {
      ...state,
      lastUpdated: new Date().getTime()
    });
  })
);

export const batchProcessingStatusFeature = createFeature({
  name: BATCH_PROCESSING_STATUS_FEATURE_KEY,
  reducer: batchProcessingStatusReducer
});
