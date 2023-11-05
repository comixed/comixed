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

import { createFeature, createReducer, on } from '@ngrx/store';
import { metadataUpdateProcessStatusUpdated } from '../actions/metadata-update-process.actions';

export const METADATA_UPDATE_PROCESS_FEATURE_KEY =
  'metadata_update_process_state';

export interface MetadataUpdateProcessState {
  active: boolean;
  totalComics: number;
  completedComics: number;
}

export const initialState: MetadataUpdateProcessState = {
  active: false,
  totalComics: 0,
  completedComics: 0
};

export const reducer = createReducer(
  initialState,

  on(metadataUpdateProcessStatusUpdated, (state, action) => ({
    ...state,
    active: action.active,
    totalComics: action.totalComics,
    completedComics: action.completedComics
  }))
);

export const metadataUpdateProcessFeature = createFeature({
  name: METADATA_UPDATE_PROCESS_FEATURE_KEY,
  reducer
});
