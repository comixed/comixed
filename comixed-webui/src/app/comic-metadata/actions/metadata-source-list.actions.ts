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

export const loadMetadataSources = createAction(
  '[Metadata Source List] Load all metadata sources'
);

export const metadataSourcesLoaded = createAction(
  '[Metadata Source List] All metadata sources loaded',
  props<{ sources: MetadataSource[] }>()
);

export const loadMetadataSourcesFailed = createAction(
  '[Metadata Source List] Failed to load metadata sources'
);

export const preferMetadataSource = createAction(
  '[Metadata Source List] Mark metadata source as preferred',
  props<{ id: number }>()
);

export const preferMetadataSourceFailed = createAction(
  '[Metadata Source List] Mark metadata source as preferred'
);
