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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  editMultipleComics,
  editMultipleComicsFailed,
  libraryStateLoaded,
  loadLibraryState,
  loadLibraryStateFailed,
  multipleComicsEdited
} from '../actions/library.actions';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';
import { ByPublisherAndYearSegment } from '@app/library/models/net/by-publisher-and-year-segment';

export const LIBRARY_FEATURE_KEY = 'library_state';

export interface LibraryState {
  busy: boolean;
  totalComics: number;
  unscrapedComics: number;
  deletedComics: number;
  publishers: RemoteLibrarySegmentState[];
  series: RemoteLibrarySegmentState[];
  characters: RemoteLibrarySegmentState[];
  teams: RemoteLibrarySegmentState[];
  locations: RemoteLibrarySegmentState[];
  stories: RemoteLibrarySegmentState[];
  states: RemoteLibrarySegmentState[];
  byPublisherAndYear: ByPublisherAndYearSegment[];
}

export const initialState: LibraryState = {
  busy: false,
  totalComics: 0,
  unscrapedComics: 0,
  deletedComics: 0,
  publishers: [],
  series: [],
  characters: [],
  teams: [],
  locations: [],
  stories: [],
  byPublisherAndYear: [],
  states: []
};

export const reducer = createReducer(
  initialState,

  on(editMultipleComics, state => ({ ...state, busy: true })),
  on(multipleComicsEdited, state => ({ ...state, busy: false })),
  on(editMultipleComicsFailed, state => ({ ...state, busy: false })),
  on(loadLibraryState, state => ({ ...state, busy: true })),
  on(libraryStateLoaded, (state, action) => ({
    ...state,
    busy: false,
    totalComics: action.state.totalComics,
    unscrapedComics: action.state.unscrapedComics,
    deletedComics: action.state.deletedComics,
    publishers: action.state.publishers,
    series: action.state.series,
    characters: action.state.characters,
    teams: action.state.teams,
    locations: action.state.locations,
    stories: action.state.stories,
    byPublisherAndYear: action.state.byPublisherAndYear,
    states: action.state.states
  })),
  on(loadLibraryStateFailed, state => ({ ...state, busy: false }))
);

export const libraryFeature = createFeature({
  name: LIBRARY_FEATURE_KEY,
  reducer
});
