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

import { createReducer, on } from '@ngrx/store';
import {
  loadMetadataSources,
  loadMetadataSourcesFailed,
  metadataSourcesLoaded,
  preferMetadataSource
} from '../actions/metadata-source-list.actions';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const METADATA_SOURCE_LIST_FEATURE_KEY = 'metadata_source_list_state';

export interface MetadataSourceListState {
  busy: boolean;
  sources: MetadataSource[];
}

export const initialState: MetadataSourceListState = {
  busy: false,
  sources: []
};

export const reducer = createReducer(
  initialState,

  on(loadMetadataSources, state => ({ ...state, busy: true })),
  on(metadataSourcesLoaded, (state, action) => ({
    ...state,
    busy: false,
    sources: action.sources
  })),
  on(loadMetadataSourcesFailed, state => ({ ...state, busy: false })),
  on(preferMetadataSource, state => ({ ...state, busy: true }))
);
