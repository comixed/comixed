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

import { beforeEach } from 'vitest';
import {
  BATCH_PROCESSING_STATUS_1,
  BATCH_PROCESSING_STATUS_2
} from '@app/batch/batch-fixtures';
import {
  BATCH_PROCESSING_STATUS_FEATURE_KEY,
  batchProcessingStatusAdapter,
  BatchProcessingStatusState,
  initialBatchProcessingStatusState
} from '../reducers/batch-processing-status.reducer';
import { selectBatchProcessStatusEntries } from '@app/batch/selectors/batch-processing-status.selectors';

describe('BatchProcessingStatus Selectors', () => {
  const TEST_BATCH_PROCESSING_STATUS_LIST = [
    BATCH_PROCESSING_STATUS_1,
    BATCH_PROCESSING_STATUS_2
  ];

  let state: BatchProcessingStatusState;

  beforeEach(() => {
    state = batchProcessingStatusAdapter.setAll(
      TEST_BATCH_PROCESSING_STATUS_LIST,
      initialBatchProcessingStatusState
    );
  });

  it('should return all batch processes', () => {
    expect(
      selectBatchProcessStatusEntries({
        [BATCH_PROCESSING_STATUS_FEATURE_KEY]: state
      })
    ).toStrictEqual(TEST_BATCH_PROCESSING_STATUS_LIST);
  });
});
