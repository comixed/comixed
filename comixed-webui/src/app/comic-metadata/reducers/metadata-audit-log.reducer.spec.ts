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
  reducer,
  initialState,
  MetadataAuditLogState
} from './metadata-audit-log.reducer';
import { METADATA_AUDIT_LOG_ENTRY_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  clearMetadataAuditLog,
  clearMetadataAuditLogFailed,
  loadMetadataAuditLog,
  loadMetadataAuditLogFailed,
  metadataAuditLogCleared,
  metadataAuditLogLoaded
} from '@app/comic-metadata/actions/metadata-audit-log.actions';

describe('MetadataAuditLog Reducer', () => {
  const ENTRIES = [METADATA_AUDIT_LOG_ENTRY_1];

  let state: MetadataAuditLogState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading the log entries', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadMetadataAuditLog());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success loading the log entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, entries: [] },
        metadataAuditLogLoaded({ entries: ENTRIES })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the list of entries', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('failure loading the log entries', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadMetadataAuditLogFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('clearing the audit log', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, clearMetadataAuditLog());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success clearing the audit log', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, entries: ENTRIES },
        metadataAuditLogCleared()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the log entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('failure clearing the audit log', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, entries: ENTRIES },
        clearMetadataAuditLogFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
