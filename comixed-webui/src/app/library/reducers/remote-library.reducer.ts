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
import { RemoteLibraryActions } from '../actions/remote-library.actions';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { PublisherAndYearSegment } from '@app/library/models/net/publisher-and-year-segment';

export const REMOTE_LIBRARY_FEATURE_KEY = 'remote_library_state';

export interface RemoteLibraryState {
  busy: boolean;
  totalComics: number;
  unscrapedComics: number;
  deletedComics: number;
  duplicateComics: number;
  publishers: RemoteLibrarySegment[];
  series: RemoteLibrarySegment[];
  characters: RemoteLibrarySegment[];
  teams: RemoteLibrarySegment[];
  locations: RemoteLibrarySegment[];
  stories: RemoteLibrarySegment[];
  states: RemoteLibrarySegment[];
  archiveTypes: RemoteLibrarySegment[];
  byPublisherAndYear: PublisherAndYearSegment[];
}

export const initialRemoteLibraryState: RemoteLibraryState = {
  busy: false,
  totalComics: 0,
  unscrapedComics: 0,
  deletedComics: 0,
  duplicateComics: 0,
  publishers: [],
  series: [],
  characters: [],
  teams: [],
  locations: [],
  stories: [],
  states: [],
  archiveTypes: [],
  byPublisherAndYear: []
};

export const remoteLibraryReducer = createReducer(
  initialRemoteLibraryState,
  on(RemoteLibraryActions.load, state => ({ ...state, busy: true })),
  on(RemoteLibraryActions.loadSuccess, (state, action) => ({
    ...state,
    busy: false,
    totalComics: action.state.totalComics,
    unscrapedComics: action.state.unscrapedComics,
    deletedComics: action.state.deletedComics,
    duplicateComics: action.state.duplicateComics,
    publishers: action.state.publishers,
    series: action.state.series,
    characters: action.state.characters,
    teams: action.state.teams,
    locations: action.state.locations,
    stories: action.state.stories,
    states: action.state.states,
    archiveTypes: action.state.archiveTypes,
    byPublisherAndYear: action.state.byPublisherAndYear
  })),
  on(RemoteLibraryActions.loadFailure, state => ({ ...state, busy: false }))
);

export const remoteLibraryFeature = createFeature({
  name: REMOTE_LIBRARY_FEATURE_KEY,
  reducer: remoteLibraryReducer
});
