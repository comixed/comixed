/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import * as fromLoadRestAuditLog from '../reducers/load-rest-audit-log.reducer';
import {
  selectLoadRestAuditLogEntries,
  selectLoadRestAuditLogLoading,
  selectLoadRestAuditLogState
} from './load-rest-audit-log.selectors';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/backend-status.fixtures';
import { LoadRestAuditLogEntriesState } from '../reducers/load-rest-audit-log.reducer';

describe('LoadRestAuditLog Selectors', () => {
  const ENTRIES = [REST_AUDIT_LOG_ENTRY_1];
  const LATEST = new Date().getTime();

  let state: LoadRestAuditLogEntriesState;

  beforeEach(() => {
    state = {
      loading: Math.random() * 100 > 50,
      stopped: Math.random() * 100 > 50,
      entries: ENTRIES,
      latest: LATEST
    } as LoadRestAuditLogEntriesState;
  });

  it('should select the feature state', () => {
    expect(
      selectLoadRestAuditLogState({
        [fromLoadRestAuditLog.LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the loading flag', () => {
    expect(
      selectLoadRestAuditLogLoading({
        [fromLoadRestAuditLog.LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY]: state
      })
    ).toEqual(state.loading);
  });

  it('selects the entries', () => {
    expect(
      selectLoadRestAuditLogEntries({
        [fromLoadRestAuditLog.LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
