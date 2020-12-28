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
  CLEAR_REST_AUDIT_LOG_FEATURE_KEY,
  ClearRestAuditLogState
} from 'app/backend-status/reducers/clear-rest-audit-log.reducer';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/models/rest-audit-log-entry.fixtures';
import {
  selectClearRestAuditLogCleared,
  selectClearRestAuditLogState
} from 'app/backend-status/selectors/clear-rest-audit-log.selectors';

describe('ClearRestAuditLog Selectors', () => {
  const LOG_ENTRIES = [
    REST_AUDIT_LOG_ENTRY_1
  ];
  let state: ClearRestAuditLogState;

  beforeEach(() => {
    state = { working: Math.random() * 100 > 50, entries: LOG_ENTRIES, latest: new Date().getTime() } as ClearRestAuditLogState;
  });

  it('returns the feature state', () => {
    expect(
      selectClearRestAuditLogState( {
        [CLEAR_REST_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('returns the rest audit entries cleared', () => {
    expect(
      selectClearRestAuditLogCleared({
        [CLEAR_REST_AUDIT_LOG_FEATURE_KEY]: state
    })
    ).toEqual(state.entries);
  });
});
