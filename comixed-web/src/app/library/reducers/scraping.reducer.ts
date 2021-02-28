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
  comicScraped,
  loadScrapingIssue,
  loadScrapingIssueFailed,
  loadScrapingVolumes,
  loadScrapingVolumesFailed,
  resetScraping,
  scrapeComic,
  scrapeComicFailed,
  scrapingIssueLoaded,
  scrapingVolumesLoaded
} from '@app/library/actions/scraping.actions';
import { ScrapingVolume } from '@app/library/models/scraping-volume';
import { ScrapingIssue } from '@app/library/models/scraping-issue';

export const SCRAPING_FEATURE_KEY = 'scraping_state';

export interface ScrapingState {
  loadingRecords: boolean;
  volumes: ScrapingVolume[];
  scrapingIssue: ScrapingIssue;
}

export const initialState: ScrapingState = {
  loadingRecords: false,
  volumes: [],
  scrapingIssue: null
};

export const reducer = createReducer(
  initialState,

  on(resetScraping, state => ({ ...state, volumes: [] })),
  on(loadScrapingVolumes, state => ({ ...state, loadingRecords: true })),
  on(scrapingVolumesLoaded, (state, action) => ({
    ...state,
    loadingRecords: false,
    volumes: action.volumes
  })),
  on(loadScrapingVolumesFailed, state => ({
    ...state,
    loadingRecords: false
  })),
  on(loadScrapingIssue, state => ({ ...state, loadingRecords: true })),
  on(scrapingIssueLoaded, (state, action) => ({
    ...state,
    loadingRecords: false,
    scrapingIssue: action.issue
  })),
  on(loadScrapingIssueFailed, state => ({ ...state, loadingRecords: false })),
  on(scrapeComic, state => ({ ...state, loadingRecords: true })),
  on(comicScraped, state => ({
    ...state,
    loadingRecords: false,
    volumes: [],
    scrapingIssue: null
  })),
  on(scrapeComicFailed, state => ({ ...state, loadingRecords: false }))
);
