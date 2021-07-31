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
  WEB_AUDIT_LOG_FEATURE_KEY,
  WebAuditLogState
} from '../reducers/web-audit-log.reducer';
import {
  selectWebAuditLogEntries,
  selectWebAuditLogState
} from './web-audit-log.selectors';
import {
  WEB_AUDIT_LOG_ENTRY_1,
  WEB_AUDIT_LOG_ENTRY_2,
  WEB_AUDIT_LOG_ENTRY_3
} from '@app/admin/admin.fixtures';

describe('WebAuditLog Selectors', () => {
  const ENTRIES = [
    WEB_AUDIT_LOG_ENTRY_1,
    WEB_AUDIT_LOG_ENTRY_2,
    WEB_AUDIT_LOG_ENTRY_3
  ];
  const TIMESTAMP = new Date().getTime();

  let state: WebAuditLogState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      latest: TIMESTAMP,
      entries: ENTRIES
    };
  });

  it('selects the feature state', () => {
    expect(
      selectWebAuditLogState({
        [WEB_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the logs entries', () => {
    expect(
      selectWebAuditLogEntries({ [WEB_AUDIT_LOG_FEATURE_KEY]: state })
    ).toEqual(ENTRIES);
  });
});
