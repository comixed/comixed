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

import {
  CLEAR_TASK_AUDIT_LOG_FEATURE_KEY,
  ClearTaskAuditLogState
} from '../reducers/clear-task-audit-log.reducer';
import {
  selectClearTaskAuditLogState,
  selectClearTaskingAuditLogWorking
} from './clear-task-audit-log.selectors';

describe('ClearTaskAuditLog Selectors', () => {
  let state: ClearTaskAuditLogState;

  beforeEach(() => {
    state = { working: Math.random() * 100 > 50 } as ClearTaskAuditLogState;
  });

  it('returns the feature state', () => {
    expect(
      selectClearTaskAuditLogState({
        [CLEAR_TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('returns the working state', () => {
    expect(
      selectClearTaskingAuditLogWorking({
        [CLEAR_TASK_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state.working);
  });
});
