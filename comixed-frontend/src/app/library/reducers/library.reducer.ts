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
import { LibraryState } from 'app/library/models/library-state';
import { latestUpdatedDate, mergeComics } from 'app/library/utility.functions';

export const LIBRARY_FEATURE_KEY = 'library_state';

export const initial_state: LibraryState = {
  fetching_scan_types: false,
  scan_types: [],
  fetching_formats: false,
  formats: [],
  fetching_updates: false,
  comics: [],
  last_read_dates: [],
  latest_updated_date: 0,
  pending_imports: 0,
  pending_rescans: 0,
  starting_rescan: false,
  updating_comic: false,
  current_comic: null,
  clearing_metadata: false,
  blocking_hash: false,
  deleting_multiple_comics: false
};

export function reducer(
  state = initial_state,
  action: LibraryActions
): LibraryState {
  switch (action.type) {
    case LibraryActionTypes.ResetLibrary:
      return { ...state, comics: [] };

    case LibraryActionTypes.GetScanTypes:
      return { ...state, fetching_scan_types: true };

    case LibraryActionTypes.GotScanTypes:
      return {
        ...state,
        fetching_scan_types: false,
        scan_types: action.payload.scan_types
      };

    case LibraryActionTypes.GetScanTypesFailed:
      return { ...state, fetching_scan_types: false };

    case LibraryActionTypes.GetFormats:
      return { ...state, fetching_formats: true };

    case LibraryActionTypes.GotFormats:
      return {
        ...state,
        fetching_formats: false,
        formats: action.payload.formats
      };

    case LibraryActionTypes.GetFormatsFailed:
      return { ...state, fetching_formats: false };

    case LibraryActionTypes.GetUpdates:
      return { ...state, fetching_updates: true };

    case LibraryActionTypes.GotUpdates: {
      const comics = mergeComics(state.comics, action.payload.comics);

      return {
        ...state,
        fetching_updates: false,
        comics: comics,
        latest_updated_date: latestUpdatedDate(comics),
        pending_imports: action.payload.pending_imports,
        pending_rescans: action.payload.pending_rescans
      };
    }

    case LibraryActionTypes.GetUpdatesFailed:
      return { ...state, fetching_updates: false };

    case LibraryActionTypes.StartRescan:
      return { ...state, starting_rescan: true };

    case LibraryActionTypes.RescanStarted:
      return { ...state, starting_rescan: false };

    case LibraryActionTypes.RescanFailedToStart:
      return { ...state, starting_rescan: false };

    case LibraryActionTypes.UpdateComic:
      return { ...state, updating_comic: true };

    case LibraryActionTypes.ComicUpdated:
      return {
        ...state,
        updating_comic: false,
        current_comic: action.payload.comic
      };

    case LibraryActionTypes.UpdateComicFailed:
      return { ...state, updating_comic: false };

    case LibraryActionTypes.ClearMetadata:
      return { ...state, clearing_metadata: true };

    case LibraryActionTypes.MetadataCleared:
      return {
        ...state,
        clearing_metadata: false,
        current_comic: action.payload.comic
      };

    case LibraryActionTypes.ClearMetadataFailed:
      return { ...state, clearing_metadata: false };

    case LibraryActionTypes.BlockPageHash:
      return { ...state, blocking_hash: true };

    case LibraryActionTypes.PageHashBlocked:
      return { ...state, blocking_hash: false };

    case LibraryActionTypes.BlockPagesFailed:
      return { ...state, blocking_hash: false };

    case LibraryActionTypes.DeleteMultipleComics:
      return { ...state, deleting_multiple_comics: true };

    case LibraryActionTypes.MultipleComicsDeleted:
      return { ...state, deleting_multiple_comics: false };

    case LibraryActionTypes.DeleteMultipleComicsFailed:
      return { ...state, deleting_multiple_comics: false };

    case LibraryActionTypes.SetCurrentComic:
      return { ...state, current_comic: action.payload.comic };

    case LibraryActionTypes.FindCurrentComic:
      return {
        ...state,
        current_comic: state.comics.find(
          comic => comic.id === action.payload.id
        )
      };

    default:
      return state;
  }
}
