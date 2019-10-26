/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { LibraryActions, LibraryActionTypes } from '../actions/library.actions';
import { latestUpdatedDate, mergeComics } from 'app/library/utility.functions';
import { Comic } from 'app/comics';
import { LastReadDate } from 'app/library/models/last-read-date';

export const LIBRARY_FEATURE_KEY = 'library_state';

export interface LibraryState {
  fetchingUpdates: boolean;
  comics: Comic[];
  updatedIds: number[];
  lastReadDates: LastReadDate[];
  latestUpdatedDate: number;
  processingCount: number;
  rescanCount: number;
  startingRescan: boolean;
  deletingComics: boolean;
}

export const initial_state: LibraryState = {
  fetchingUpdates: false,
  comics: [],
  updatedIds: [],
  lastReadDates: [],
  latestUpdatedDate: 0,
  processingCount: 0,
  rescanCount: 0,
  startingRescan: false,
  deletingComics: false
};

export function reducer(
  state = initial_state,
  action: LibraryActions
): LibraryState {
  switch (action.type) {
    case LibraryActionTypes.Reset:
      return { ...state, comics: [] };

    case LibraryActionTypes.GetUpdates:
      return { ...state, fetchingUpdates: true };

    case LibraryActionTypes.UpdatesReceived: {
      const comics = mergeComics(state.comics, action.payload.comics);

      return {
        ...state,
        fetchingUpdates: false,
        comics: comics,
        updatedIds: action.payload.comics.map(comic => comic.id),
        lastReadDates: action.payload.lastReadDates,
        latestUpdatedDate: latestUpdatedDate(comics),
        processingCount: action.payload.processingCount,
        rescanCount: action.payload.rescanCount
      };
    }

    case LibraryActionTypes.GetUpdatesFailed:
      return { ...state, fetchingUpdates: false };

    case LibraryActionTypes.StartRescan:
      return { ...state, startingRescan: true };

    case LibraryActionTypes.RescanStarted:
      return { ...state, startingRescan: false };

    case LibraryActionTypes.RescanFailedToStart:
      return { ...state, startingRescan: false };

    case LibraryActionTypes.DeleteMultipleComics:
      return { ...state, deletingComics: true };

    case LibraryActionTypes.MultipleComicsDeleted:
      return { ...state, deletingComics: false };

    case LibraryActionTypes.DeleteMultipleComicsFailed:
      return { ...state, deletingComics: false };

    default:
      return state;
  }
}
