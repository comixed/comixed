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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  startEntireLibraryOrganization,
  startEntireLibraryOrganizationFailure,
  startEntireLibraryOrganizationSuccess,
  startLibraryOrganization,
  startLibraryOrganizationFailure,
  startLibraryOrganizationSuccess
} from '@app/library/actions/organize-library.actions';

export const ORGANIZE_LIBRARY_FEATURE_KEY = 'organize_library_state';

export interface OrganizeLibraryState {
  sending: boolean;
}

export const initialState: OrganizeLibraryState = {
  sending: false
};

export const reducer = createReducer(
  initialState,

  on(startLibraryOrganization, state => ({ ...state, sending: true })),
  on(startLibraryOrganizationSuccess, state => ({ ...state, sending: false })),
  on(startLibraryOrganizationFailure, state => ({ ...state, sending: false })),
  on(startEntireLibraryOrganization, state => ({ ...state, sending: true })),
  on(startEntireLibraryOrganizationSuccess, state => ({
    ...state,
    sending: false
  })),
  on(startEntireLibraryOrganizationFailure, state => ({
    ...state,
    sending: false
  }))
);

export const organizeLibraryFeature = createFeature({
  name: ORGANIZE_LIBRARY_FEATURE_KEY,
  reducer
});
