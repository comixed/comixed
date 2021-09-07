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

import { createReducer, on } from '@ngrx/store';
import {
  metadataUpdating,
  updateMetadata,
  updateMetadataFailed
} from '@app/library/actions/update-metadata.actions';

export const UPDATE_METADATA_FEATURE_KEY = 'update_metadata_state';

export interface UpdateMetadataState {
  updating: boolean;
}

export const initialState: UpdateMetadataState = {
  updating: false
};

export const reducer = createReducer(
  initialState,

  on(updateMetadata, state => ({ ...state, updating: true })),
  on(metadataUpdating, state => ({ ...state, updating: false })),
  on(updateMetadataFailed, state => ({ ...state, updating: false }))
);
