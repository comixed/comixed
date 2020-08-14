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
  ClearTaskAuditLogState,
  initialState,
  reducer
} from './clear-task-audit-log.reducer';
import {
  clearTaskAuditLog,
  cleartaskAuditLogFailed,
  taskAuditLogCleared
} from 'app/backend-status/actions/clear-task-audit-log.actions';

describe('ClearTaskAuditLog Reducer', () => {
  let state: ClearTaskAuditLogState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the working flag', () => {
      expect(state.working).toBeFalsy();
    });
  });

  describe('clearing the task audit log', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: false }, clearTaskAuditLog());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeTruthy();
    });
  });

  describe('clearing the task audit log succeeds', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, taskAuditLogCleared());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeFalsy();
    });
  });

  describe('clearing the task audit log fails', () => {
    beforeEach(() => {
      state = reducer({ ...state, working: true }, cleartaskAuditLogFailed());
    });

    it('sets the working flag', () => {
      expect(state.working).toBeFalsy();
    });
  });
});
