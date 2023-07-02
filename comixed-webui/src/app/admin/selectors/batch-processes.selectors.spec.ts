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
  BATCH_PROCESSES_FEATURE_KEY,
  BatchProcessesState
} from '../reducers/batch-processes.reducer';
import {
  selectBatchProcessesState,
  selectBatchProcessList
} from './batch-processes.selectors';
import {
  BATCH_PROCESS_STATUS_1,
  BATCH_PROCESS_STATUS_2,
  BATCH_PROCESS_STATUS_3,
  BATCH_PROCESS_STATUS_4,
  BATCH_PROCESS_STATUS_5
} from '@app/admin/admin.fixtures';

describe('BatchProcesses Selectors', () => {
  const ENTRIES = [
    BATCH_PROCESS_STATUS_1,
    BATCH_PROCESS_STATUS_2,
    BATCH_PROCESS_STATUS_3,
    BATCH_PROCESS_STATUS_4,
    BATCH_PROCESS_STATUS_5
  ];

  let state: BatchProcessesState;

  beforeEach(() => {
    state = { busy: Math.random() > 0.5, entries: ENTRIES };
  });

  it('should select the feature state', () => {
    expect(
      selectBatchProcessesState({
        [BATCH_PROCESSES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('returns the list of processes', () => {
    expect(
      selectBatchProcessList({
        [BATCH_PROCESSES_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
