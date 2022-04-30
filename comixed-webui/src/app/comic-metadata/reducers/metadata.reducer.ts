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
  issueMetadataLoaded,
  loadIssueMetadata,
  loadIssueMetadataFailed,
  loadVolumeMetadata,
  loadVolumeMetadataFailed,
  resetMetadataState,
  scrapeComic,
  scrapeComicFailed,
  setAutoSelectExactMatch,
  setChosenMetadataSource,
  setConfirmBeforeScraping,
  volumeMetadataLoaded
} from '@app/comic-metadata/actions/metadata.actions';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { IssueMetadata } from '@app/comic-metadata/models/issue-metadata';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const METADATA_FEATURE_KEY = 'metadata_state';

export interface MetadataState {
  loadingRecords: boolean;
  volumes: VolumeMetadata[];
  scrapingIssue: IssueMetadata;
  metadataSource: MetadataSource;
  confirmBeforeScraping: boolean;
  autoSelectExactMatch: boolean;
}

export const initialState: MetadataState = {
  loadingRecords: false,
  volumes: [],
  scrapingIssue: null,
  metadataSource: null,
  confirmBeforeScraping: true,
  autoSelectExactMatch: false
};

export const reducer = createReducer(
  initialState,

  on(resetMetadataState, state => ({
    ...state,
    volumes: [],
    confirmBeforeScraping: true,
    autoSelectExactMatch: false
  })),
  on(setConfirmBeforeScraping, (state, action) => ({
    ...state,
    confirmBeforeScraping: action.confirmBeforeScraping
  })),
  on(setAutoSelectExactMatch, (state, action) => ({
    ...state,
    autoSelectExactMatch: action.autoSelectExactMatch
  })),
  on(loadVolumeMetadata, state => ({ ...state, loadingRecords: true })),
  on(volumeMetadataLoaded, (state, action) => ({
    ...state,
    loadingRecords: false,
    volumes: action.volumes
  })),
  on(loadVolumeMetadataFailed, state => ({
    ...state,
    loadingRecords: false
  })),
  on(loadIssueMetadata, state => ({ ...state, loadingRecords: true })),
  on(issueMetadataLoaded, (state, action) => ({
    ...state,
    loadingRecords: false,
    scrapingIssue: action.issue
  })),
  on(loadIssueMetadataFailed, state => ({ ...state, loadingRecords: false })),
  on(scrapeComic, state => ({ ...state, loadingRecords: true })),
  on(comicScraped, state => ({
    ...state,
    loadingRecords: false,
    volumes: [],
    scrapingIssue: null
  })),
  on(scrapeComicFailed, state => ({ ...state, loadingRecords: false })),
  on(setChosenMetadataSource, (state, action) => ({
    ...state,
    metadataSource: action.metadataSource
  }))
);
