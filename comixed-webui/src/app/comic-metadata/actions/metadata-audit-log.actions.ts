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

import { createAction, props } from '@ngrx/store';
import { MetadataAuditLogEntry } from '@app/comic-metadata/models/metadata-audit-log-entry';

export const loadMetadataAuditLog = createAction(
  '[Metadata Audit Log] Load audit log'
);

export const metadataAuditLogLoaded = createAction(
  '[Metadata Audit Log] Log loaded',
  props<{ entries: MetadataAuditLogEntry[] }>()
);

export const loadMetadataAuditLogFailed = createAction(
  '[Metadata Audit Log] Failed to load audit log'
);

export const clearMetadataAuditLog = createAction(
  '[Metadata Audit Log] Clears the metadata audit log'
);

export const metadataAuditLogCleared = createAction(
  '[Metadata Audit Log] The metadata audit log was cleared'
);

export const clearMetadataAuditLogFailed = createAction(
  '[Metadata Audit Log] Failed to clear the metadata audit log'
);
