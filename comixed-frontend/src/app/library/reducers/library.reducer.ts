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
  fetchingScanTypes: false,
  scanTypes: [],
  fetchingFormats: false,
  formats: [],
  fetchingUpdates: false,
  comics: [],
  lastReadDates: [],
  latestUpdatedDate: 0,
  processingCount: 0,
  rescanCount: 0,
  startingRescan: false,
  updatingComic: false,
  currentComic: null,
  clearingMetadata: false,
  blockingHash: false,
  deletingComics: false
};

export function reducer(
  state = initial_state,
  action: LibraryActions
): LibraryState {
  switch (action.type) {
    case LibraryActionTypes.Reset:
      return { ...state, comics: [] };

    case LibraryActionTypes.GetScanTypes:
      return { ...state, fetchingScanTypes: true };

    case LibraryActionTypes.ScanTypesReceived:
      return {
        ...state,
        fetchingScanTypes: false,
        scanTypes: action.payload.scanTypes
      };

    case LibraryActionTypes.GetScanTypesFailed:
      return { ...state, fetchingScanTypes: false };

    case LibraryActionTypes.GetFormats:
      return { ...state, fetchingFormats: true };

    case LibraryActionTypes.FormatsReceived:
      return {
        ...state,
        fetchingFormats: false,
        formats: action.payload.formats
      };

    case LibraryActionTypes.GetFormatsFailed:
      return { ...state, fetchingFormats: false };

    case LibraryActionTypes.GetUpdates:
      return { ...state, fetchingUpdates: true };

    case LibraryActionTypes.UpdatesReceived: {
      const comics = mergeComics(state.comics, action.payload.comics);
      let currentComic = state.currentComic;

      if (currentComic) {
        const update = action.payload.comics.find(
          entry => entry.id === currentComic.id
        );
        if (!!update) {
          currentComic = update;
        }
      }

      return {
        ...state,
        fetchingUpdates: false,
        comics: comics,
        currentComic: currentComic,
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

    case LibraryActionTypes.UpdateComic:
      return { ...state, updatingComic: true };

    case LibraryActionTypes.ComicUpdated:
      return {
        ...state,
        updatingComic: false,
        currentComic: action.payload.comic
      };

    case LibraryActionTypes.UpdateComicFailed:
      return { ...state, updatingComic: false };

    case LibraryActionTypes.ClearMetadata:
      return { ...state, clearingMetadata: true };

    case LibraryActionTypes.MetadataCleared:
      return {
        ...state,
        clearingMetadata: false,
        currentComic: action.payload.comic
      };

    case LibraryActionTypes.ClearMetadataFailed:
      return { ...state, clearingMetadata: false };

    case LibraryActionTypes.BlockPageHash:
      return { ...state, blockingHash: true };

    case LibraryActionTypes.PageHashBlocked:
      return { ...state, blockingHash: false };

    case LibraryActionTypes.BlockPagesFailed:
      return { ...state, blockingHash: false };

    case LibraryActionTypes.DeleteMultipleComics:
      return { ...state, deletingComics: true };

    case LibraryActionTypes.MultipleComicsDeleted:
      return { ...state, deletingComics: false };

    case LibraryActionTypes.DeleteMultipleComicsFailed:
      return { ...state, deletingComics: false };

    case LibraryActionTypes.SetCurrentComic:
      return { ...state, currentComic: action.payload.comic };

    case LibraryActionTypes.FindCurrentComic:
      return {
        ...state,
        currentComic: state.comics.find(comic => comic.id === action.payload.id)
      };

    default:
      return state;
  }
}
