/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import {LOAD_TASK_AUDIT_LOG_FEATURE_KEY, LoadTaskAuditLogState} from '../reducers/load-task-audit-log.reducer';
import {
  selectLoadTaskAuditLogState,
  selectTaskAuditLogEntries,
  selectTaskAuditLogLatest,
  selectTaskAuditLogLoading
} from './load-task-audit-log.selectors';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/backend-status.fixtures';

describe('LoadTaskAuditLog Selectors', () => {
  const LOG_ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_2,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
  ];
  let state: LoadTaskAuditLogState;

  beforeEach(() => {
    state = {
      latest: new Date().getTime(),
      entries: LOG_ENTRIES,
      loading: Math.random() * 100 > 50
    } as LoadTaskAuditLogState;
  });

  it('can select the feature state', () => {
    expect(
      selectLoadTaskAuditLogState({ [LOAD_TASK_AUDIT_LOG_FEATURE_KEY]: state })
    ).toEqual(state);
  });

  it('can select the loading state', () => {
    expect(
      selectTaskAuditLogLoading({
        [LOAD_TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state.loading);
  });

  it('can select the entries', () => {
    expect(
      selectTaskAuditLogEntries({
        [LOAD_TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });

  it('can select the latest entry date', () => {
    expect(
      selectTaskAuditLogLatest({
        [LOAD_TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state.latest);
  });
});
