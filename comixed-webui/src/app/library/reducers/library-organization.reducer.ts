/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { LibraryOrganizationActions } from '../actions/library-organization.actions';

export const LIBRARY_ORGANIZATION_FEATURE_KEY = 'library_organization_state';

export interface LibraryOrganizationState {
  busy: boolean;
}

export const initialLibraryOrganizationState: LibraryOrganizationState = {
  busy: false
};

export const libraryOrganizationReducer = createReducer(
  initialLibraryOrganizationState,
  on(LibraryOrganizationActions.organizeSelectedComics, state => ({
    ...state,
    busy: true
  })),
  on(LibraryOrganizationActions.organizeSelectedComicsSuccess, state => ({
    ...state,
    busy: false
  })),
  on(LibraryOrganizationActions.organizeSelectedComicsFailure, state => ({
    ...state,
    busy: false
  })),
  on(LibraryOrganizationActions.organizeAllComics, state => ({
    ...state,
    busy: true
  })),
  on(LibraryOrganizationActions.organizeAllComicsSuccess, state => ({
    ...state,
    busy: false
  })),
  on(LibraryOrganizationActions.organizeAllComicsFailure, state => ({
    ...state,
    busy: false
  }))
);

export const libraryOrganizationFeature = createFeature({
  name: LIBRARY_ORGANIZATION_FEATURE_KEY,
  reducer: libraryOrganizationReducer
});
