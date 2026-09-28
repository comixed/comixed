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

import { BatchProcess } from '@app/batch/models/batch-process';
import { BatchProcessingStatus } from '@app/batch/models/batch-processing-status';

export const BATCH_PROCESS_1: BatchProcess = {
  jobId: 10000,
  jobName: 'The Batch Process 1',
  parameters: new Map<string, string>(),
  status: 'RUNNING',
  createTime: new Date().getTime() - 60000,
  startTime: new Date().getTime() - 30000,
  lastUpdateTime: new Date().getTime(),
  endTime: new Date().getTime(),
  running: false,
  exitStatus: 'COMPLETED',
  errors: ''
};

export const BATCH_PROCESS_2: BatchProcess = {
  jobId: 10001,
  jobName: 'The Batch Process 1',
  parameters: new Map<string, string>(),
  status: 'RUNNING',
  createTime: new Date().getTime(),
  startTime: new Date().getTime(),
  lastUpdateTime: new Date().getTime(),
  endTime: null,
  running: true,
  exitStatus: '',
  errors: ''
};

export const BATCH_PROCESSING_STATUS_1: BatchProcessingStatus = {
  jobId: 104,
  stepName: 'step.1',
  total: 100,
  processed: 75
};

export const BATCH_PROCESSING_STATUS_2: BatchProcessingStatus = {
  jobId: 105,
  stepName: 'step.2',
  total: 200,
  processed: 75
};
