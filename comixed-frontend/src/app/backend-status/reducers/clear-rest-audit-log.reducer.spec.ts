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
  ClearRestAuditLogState,
  initalState,
  reducer
} from 'app/backend-status/reducers/clear-rest-audit-log.reducer';
import {
  clearLoadedAuditLog,
  clearRestAuditLog,
  clearRestAuditLogFailed,
  restAuditLogClearSuccess
} from 'app/backend-status/actions/clear-rest-audit-log.actions';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/models/rest-audit-log-entry.fixtures';

describe('ClearRestAuditLog Reducer', () => {
  const LOG_ENTRIES = [REST_AUDIT_LOG_ENTRY_1];
  let state: ClearRestAuditLogState;

  beforeEach(() => {
    state = initalState;
  });

  describe('the initiel state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalsy();
    });
  });

  describe('clearing the rest audit log', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: false }, clearRestAuditLog());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeTruthy();
    });
  });

  describe('clearing the rest audit log succeeds', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, restAuditLogClearSuccess());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeFalsy();
    });
  });

  describe('clearing the rest audit log fails', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, clearRestAuditLogFailed());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeFalsy();
    });
  });

  describe('clearing the loaded rest audit log', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          working: true,
          entries: LOG_ENTRIES,
          latest: new Date().getTime()
        },
        clearLoadedAuditLog
      );
    });

    it('clear the load entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('resets the latest date', () => {
      expect(state.latest).toEqual(0);
    });
  });
});
