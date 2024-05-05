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

import { createAction, props } from '@ngrx/store';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';

export const loadBatchProcessList = createAction(
  '[Batch Processes] Load the list of batch processes'
);

export const loadBatchProcessListSuccess = createAction(
  '[Batch Processes] The list of batch processes loaded successfully',
  props<{ processes: BatchProcessDetail[] }>()
);

export const loadBatchProcessListFailure = createAction(
  '[Batch Processes] Failed to load the list of batch processes'
);

export const batchProcessUpdateReceived = createAction(
  '[Batch Processes] Received a batch process update',
  props<{
    update: BatchProcessDetail;
  }>()
);

export const setBatchProcessDetail = createAction(
  '[Batch Processes] Sets the current batch process detail entry',
  props<{
    detail: BatchProcessDetail | null;
  }>()
);

export const deleteCompletedBatchJobs = createAction(
  '[Batch Processes] Delete completed batch jobs'
);

export const deleteCompletedBatchJobsSuccess = createAction(
  '[Batch Processes] Successfully deleted completed batch jobs',
  props<{
    processes: BatchProcessDetail[];
  }>()
);

export const deleteCompletedBatchJobsFailure = createAction(
  '[Batch Processes] Failed to delete completed batch jobs'
);
