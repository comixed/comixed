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

import { ComicActions, ComicActionTypes } from '../actions/comic.actions';
import { Comic, ComicFormat, PageType, ScanType } from 'app/comics';

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
  comic: Comic;
  savingPage: boolean;
  blockingPageHash: boolean;
  savingComic: boolean;
  clearingMetadata: boolean;
  deletingComic: boolean;
  scrapingComic: boolean;
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
  comic: null,
  savingPage: false,
  blockingPageHash: false,
  savingComic: false,
  clearingMetadata: false,
  deletingComic: false,
  scrapingComic: false
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
      return { ...state, fetchingComic: true };

    case ComicActionTypes.GotIssue:
      return { ...state, fetchingComic: false, comic: action.payload.comic };

    case ComicActionTypes.GetIssueFailed:
      return { ...state, fetchingComic: false };

    case ComicActionTypes.SavePage:
      return { ...state, savingPage: true };

    case ComicActionTypes.PageSaved:
      return { ...state, savingPage: false, comic: action.payload.comic };

    case ComicActionTypes.SavePageFailed:
      return { ...state, savingPage: false };

    case ComicActionTypes.SetPageHashBlocking:
      return { ...state, blockingPageHash: true };

    case ComicActionTypes.PageHashBlockingSet:
      return { ...state, blockingPageHash: false, comic: action.payload.comic };

    case ComicActionTypes.SetPageHashBlockingFailed:
      return { ...state, blockingPageHash: false };

    case ComicActionTypes.SaveComic:
      return { ...state, savingComic: true };

    case ComicActionTypes.ComicSaved:
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

    case ComicActionTypes.ComicDeleted:
      return { ...state, deletingComic: false, comic: null };

    case ComicActionTypes.DeleteComicFailed:
      return { ...state, deletingComic: false };

    case ComicActionTypes.ScrapeComic:
      return { ...state, scrapingComic: true };

    case ComicActionTypes.ComicScraped:
      return { ...state, scrapingComic: false, comic: action.payload.comic };

    case ComicActionTypes.ScrapeComicFailed:
      return { ...state, scrapingComic: false };

    default:
      return state;
  }
}
