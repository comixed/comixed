/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
  TASK_AUDIT_LOG_FEATURE_KEY,
  TaskAuditLogState
} from '../reducers/task-audit-log.reducer';
import {
  selectTaskAuditLogEntries,
  selectTaskAuditLogState
} from './task-audit-log.selectors';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_5
} from '@app/admin/admin.fixtures';

describe('TaskAuditLog Selectors', () => {
  const ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_5
  ];
  const LATEST = Math.abs(Math.ceil(Math.random() * 1000));

  let state: TaskAuditLogState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      entries: ENTRIES,
      latest: LATEST,
      lastPage: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectTaskAuditLogState({
        [TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the entries', () => {
    expect(
      selectTaskAuditLogEntries({
        [TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
