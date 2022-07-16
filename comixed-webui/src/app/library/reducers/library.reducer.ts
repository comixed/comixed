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

import { createReducer, on } from '@ngrx/store';
import {
  clearSelectedComics,
  deselectComics,
  editMultipleComics,
  editMultipleComicsFailed,
  libraryStateLoaded,
  loadLibraryState,
  loadLibraryStateFailed,
  multipleComicsEdited,
  selectComics
} from '../actions/library.actions';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { LibrarySegmentState } from '@app/library/models/net/library-segment-state';

export const LIBRARY_FEATURE_KEY = 'library_state';

export interface LibraryState {
  totalComics: number;
  unscrapedComics: number;
  deletedComics: number;
  publishers: LibrarySegmentState[];
  series: LibrarySegmentState[];
  characters: LibrarySegmentState[];
  teams: LibrarySegmentState[];
  locations: LibrarySegmentState[];
  stories: LibrarySegmentState[];
  states: LibrarySegmentState[];
  selected: ComicBook[];
  busy: boolean;
}

export const initialState: LibraryState = {
  selected: [],
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
  states: []
};

export const reducer = createReducer(
  initialState,

  on(selectComics, (state, action) => {
    const selected = state.selected.filter(
      comicBook => action.comicBooks.includes(comicBook) === false
    );

    return { ...state, selected: selected.concat(action.comicBooks) };
  }),
  on(deselectComics, (state, action) => {
    const selected = state.selected.filter(
      comicBook => action.comicBooks.includes(comicBook) === false
    );

    return { ...state, selected };
  }),
  on(clearSelectedComics, state => ({ ...state, selected: [] })),
  on(editMultipleComics, state => ({ ...state, busy: true })),
  on(multipleComicsEdited, state => ({ ...state, busy: false })),
  on(editMultipleComicsFailed, state => ({ ...state, busy: false })),
  on(loadLibraryState, state => ({ ...state, busy: true })),
  on(libraryStateLoaded, (state, action) => ({
    ...state,
    busy: false,
    totalComics: action.state.totalComics,
    deletedComics: action.state.deletedComics,
    publishers: action.state.publishers,
    series: action.state.series,
    characters: action.state.characters,
    teams: action.state.teams,
    locations: action.state.locations,
    stories: action.state.stories,
    states: action.state.states
  })),
  on(loadLibraryStateFailed, state => ({ ...state, busy: false }))
);
