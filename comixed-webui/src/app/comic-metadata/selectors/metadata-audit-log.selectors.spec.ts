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

import * as fromMetadataAuditLog from '../reducers/metadata-audit-log.reducer';
import {
  selectMetadataAuditLogEntries,
  selectMetadataAuditLogState
} from './metadata-audit-log.selectors';
import {
  METADATA_AUDIT_LOG_FEATURE_KEY,
  MetadataAuditLogState
} from '../reducers/metadata-audit-log.reducer';
import { METADATA_AUDIT_LOG_ENTRY_1 } from '@app/comic-metadata/comic-metadata.fixtures';

describe('MetadataAuditLog Selectors', () => {
  let state: MetadataAuditLogState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      entries: [METADATA_AUDIT_LOG_ENTRY_1]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMetadataAuditLogState({
        [METADATA_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the log entries', () => {
    expect(
      selectMetadataAuditLogEntries({
        [METADATA_AUDIT_LOG_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
