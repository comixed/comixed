/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const clearMetadataSource = createAction(
  '[Metadata Source] Clear the current metadata source'
);

export const loadMetadataSource = createAction(
  '[Metadata Source] Load a metadata source',
  props<{ id: number }>()
);

export const metadataSourceLoaded = createAction(
  '[Metadata Source] Metadata source was loaded',
  props<{ source: MetadataSource }>()
);

export const loadMetadataSourceFailed = createAction(
  '[Metadata Source] Failed to load a metadata source'
);

export const saveMetadataSource = createAction(
  '[Metadata Source] Save a metadata source',
  props<{ source: MetadataSource }>()
);

export const metadataSourceSaved = createAction(
  '[Metadata Source] Metadata source saved',
  props<{ source: MetadataSource }>()
);

export const saveMetadataSourceFailed = createAction(
  '[Metadata source] Failed to save a metadata source'
);

export const deleteMetadataSource = createAction(
  '[Metadata Source] Delete a metadata source',
  props<{ source: MetadataSource }>()
);

export const metadataSourceDeleted = createAction(
  '[Metadata Source] Metadata source deleted'
);

export const deleteMetadataSourceFailed = createAction(
  '[Metadata Source] Failed to delete a metadata source'
);
