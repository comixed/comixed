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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Comic, ComicFormat, PageType, ScanType } from 'app/comics';
import { ComicActions, ComicActionTypes } from '../actions/comic.actions';

export const COMIC_FEATURE_KEY = 'comic';

export interface ComicState {
  fetchingScanTypes: boolean;
  scanTypes: ScanType[];
  scanTypesLoaded: boolean;
  fetchingFormats: boolean;
  formats: ComicFormat[];
  formatsLoaded: boolean;
  fetchingPageTypes: boolean;
  pageTypes: PageType[];
  pageTypesLoaded: boolean;
  fetchingComic: boolean;
  noComic: boolean;
  comic: Comic;
  savingPage: boolean;
  settingPageType: boolean;
  deletingPage: boolean;
  blockingPageHash: boolean;
  savingComic: boolean;
  clearingMetadata: boolean;
  deletingComic: boolean;
  restoringComic: boolean;
  scrapingComic: boolean;
  settingReadState: boolean;
}

export const initialState: ComicState = {
  fetchingScanTypes: false,
  scanTypes: [],
  scanTypesLoaded: false,
  fetchingFormats: false,
  formats: [],
  formatsLoaded: false,
  fetchingPageTypes: false,
  pageTypes: [],
  pageTypesLoaded: false,
  fetchingComic: false,
  noComic: false,
  comic: null,
  savingPage: false,
  settingPageType: false,
  deletingPage: false,
  blockingPageHash: false,
  savingComic: false,
  clearingMetadata: false,
  deletingComic: false,
  restoringComic: false,
  scrapingComic: false,
  settingReadState: false
};

export function reducer(
  state = initialState,
  action: ComicActions
): ComicState {
  switch (action.type) {
    case ComicActionTypes.GetScanTypes:
      return { ...state, fetchingScanTypes: true };

    case ComicActionTypes.GotScanTypes:
      return {
        ...state,
        fetchingScanTypes: false,
        scanTypesLoaded: true,
        scanTypes: action.payload.scanTypes
      };

    case ComicActionTypes.GetScanTypesFailed:
      return { ...state, fetchingScanTypes: false, scanTypesLoaded: false };

    case ComicActionTypes.GetFormats:
      return { ...state, fetchingFormats: true };

    case ComicActionTypes.GotFormats:
      return {
        ...state,
        fetchingFormats: false,
        formatsLoaded: true,
        formats: action.payload.formats
      };

    case ComicActionTypes.GetFormatsFailed:
      return { ...state, fetchingFormats: false, formatsLoaded: false };

    case ComicActionTypes.GetPageTypes:
      return { ...state, fetchingPageTypes: true };

    case ComicActionTypes.GotPageTypes:
      return {
        ...state,
        fetchingPageTypes: false,
        pageTypesLoaded: true,
        pageTypes: action.payload.pageTypes
      };

    case ComicActionTypes.GetPageTypesFailed:
      return { ...state, fetchingPageTypes: false, pageTypesLoaded: false };

    case ComicActionTypes.GetIssue:
      return { ...state, fetchingComic: true, noComic: false };

    case ComicActionTypes.GotIssue:
      return { ...state, fetchingComic: false, comic: action.payload.comic };

    case ComicActionTypes.GetIssueFailed:
      return { ...state, fetchingComic: false, noComic: true };

    case ComicActionTypes.SavePage:
      return { ...state, savingPage: true };

    case ComicActionTypes.PageSaved:
      return { ...state, savingPage: false, comic: action.payload.comic };

    case ComicActionTypes.SavePageFailed:
      return { ...state, savingPage: false };

    case ComicActionTypes.SetPageType:
      return { ...state, settingPageType: true };

    case ComicActionTypes.PageTypeSet: {
      const updatedPage = action.payload.page;
      const comic = state.comic;
      const index = comic.pages.findIndex(page => page.id === updatedPage.id);
      comic.pages[index] = updatedPage;
      return { ...state, settingPageType: false, comic: comic };
    }

    case ComicActionTypes.SetPageTypeFailed:
      return { ...state, settingPageType: false };

    case ComicActionTypes.SetPageDeleted:
      return { ...state, deletingPage: true };

    case ComicActionTypes.PageDeletedSet:
      return { ...state, deletingPage: false, comic: action.payload.comic };

    case ComicActionTypes.SetPageDeletedFailed:
      return { ...state, deletingPage: false };

    case ComicActionTypes.SetPageHashBlocking:
      return { ...state, blockingPageHash: true };

    case ComicActionTypes.PageHashBlockingSet:
      return { ...state, blockingPageHash: false, comic: action.payload.comic };

    case ComicActionTypes.SetPageHashBlockingFailed:
      return { ...state, blockingPageHash: false };

    case ComicActionTypes.SaveComic:
      return { ...state, savingComic: true };

    case ComicActionTypes.SaveComicSucceeded:
      return { ...state, savingComic: false, comic: action.payload.comic };

    case ComicActionTypes.SaveComicFailed:
      return { ...state, savingComic: false };

    case ComicActionTypes.ClearMetadata:
      return { ...state, clearingMetadata: true };

    case ComicActionTypes.MetadataCleared:
      return { ...state, clearingMetadata: false, comic: action.payload.comic };

    case ComicActionTypes.ClearMetadataFailed:
      return { ...state, clearingMetadata: false };

    case ComicActionTypes.DeleteComic:
      return { ...state, deletingComic: true };

    case ComicActionTypes.DeleteComicSucceeded:
      return { ...state, deletingComic: false, comic: action.payload.comic };

    case ComicActionTypes.DeleteComicFailed:
      return { ...state, deletingComic: false };

    case ComicActionTypes.RestoreComic:
      return { ...state, restoringComic: true };

    case ComicActionTypes.RestoreComicSucceeded:
      return { ...state, restoringComic: false, comic: action.payload.comic };

    case ComicActionTypes.RestoreComicFailed:
      return { ...state, restoringComic: false };

    case ComicActionTypes.MarkAsRead:
      return { ...state, settingReadState: true };

    case ComicActionTypes.MarkedAsRead:
      return {
        ...state,
        settingReadState: false,
        comic: { ...state.comic, lastRead: action.payload.lastRead }
      };

    case ComicActionTypes.MarkAsReadFailed:
      return { ...state, settingReadState: false };

    default:
      return state;
  }
}
