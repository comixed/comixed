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
  clearMetadataSource,
  deleteMetadataSource,
  deleteMetadataSourceFailed,
  loadMetadataSource,
  loadMetadataSourceFailed,
  metadataSourceDeleted,
  metadataSourceLoaded,
  metadataSourceSaved,
  saveMetadataSource,
  saveMetadataSourceFailed
} from '../actions/metadata-source.actions';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const METADATA_SOURCE_FEATURE_KEY = 'metadata_source_state';

export interface MetadataSourceState {
  busy: boolean;
  source: MetadataSource;
}

export const initialState: MetadataSourceState = {
  busy: false,
  source: null
};

export const reducer = createReducer(
  initialState,

  on(clearMetadataSource, state => ({ ...state, source: null })),
  on(loadMetadataSource, state => ({ ...state, busy: true })),
  on(metadataSourceLoaded, (state, action) => ({
    ...state,
    busy: false,
    source: action.source,
    saved: false
  })),
  on(loadMetadataSourceFailed, state => ({ ...state, busy: false })),
  on(saveMetadataSource, state => ({ ...state, busy: true })),
  on(metadataSourceSaved, (state, action) => ({
    ...state,
    busy: false,
    source: action.source
  })),
  on(saveMetadataSourceFailed, state => ({ ...state, busy: false })),
  on(deleteMetadataSource, state => ({ ...state, busy: true })),
  on(metadataSourceDeleted, state => ({ ...state, busy: false, source: null })),
  on(deleteMetadataSourceFailed, state => ({ ...state, busy: false }))
);
