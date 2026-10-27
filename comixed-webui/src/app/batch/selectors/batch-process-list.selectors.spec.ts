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
  BATCH_PROCESS_LIST_FEATURE_KEY,
  batchProcessListAdaptor,
  BatchProcessListState,
  initialBatchProcessListState
} from '@app/batch/reducers/batch-process-list.reducer';
import { beforeEach } from 'vitest';
import { BATCH_PROCESS_1, BATCH_PROCESS_2 } from '@app/batch/batch-fixtures';
import { selectBatchProcessListRunningCount } from '@app/batch/selectors/batch-process-list.selectors';

describe('BatchProcessList Selectors', () => {
  const TEST_BATCH_PROCESS_LIST = [BATCH_PROCESS_1, BATCH_PROCESS_2];

  let state: BatchProcessListState;

  beforeEach(() => {
    state = batchProcessListAdaptor.setAll(
      TEST_BATCH_PROCESS_LIST,
      initialBatchProcessListState
    );
  });

  it('should return the active batch process count', () => {
    expect(
      selectBatchProcessListRunningCount({
        [BATCH_PROCESS_LIST_FEATURE_KEY]: state
      })
    ).toBe(1);
  });
});
