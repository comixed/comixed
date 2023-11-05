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

import { createAction, props } from '@ngrx/store';
import { VolumeMetadata } from '../models/volume-metadata';
import { IssueMetadata } from '../models/issue-metadata';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const resetMetadataState = createAction(
  '[Metadata] Resets the scraping state'
);

export const setChosenMetadataSource = createAction(
  '[Metadata] Sets the chosen metadata source',
  props<{ metadataSource: MetadataSource }>()
);

export const setConfirmBeforeScraping = createAction(
  '[Metadata] Sets the confirmation before scraping state',
  props<{ confirmBeforeScraping: boolean }>()
);

export const setAutoSelectExactMatch = createAction(
  '[Metadata] Sets the auto-select exact match state',
  props<{ autoSelectExactMatch: boolean }>()
);

export const loadVolumeMetadata = createAction(
  '[Metadata] Loads scraping volumes',
  props<{
    metadataSource: MetadataSource;
    series: string;
    maximumRecords: number;
    skipCache: boolean;
  }>()
);

export const volumeMetadataLoaded = createAction(
  '[Metadata] Received scraping volumes',
  props<{ volumes: VolumeMetadata[] }>()
);

export const loadVolumeMetadataFailed = createAction(
  '[Metadata] Failed to load scraping volumes'
);

export const loadIssueMetadata = createAction(
  '[Metadata] Load a scraping issue',
  props<{
    metadataSource: MetadataSource;
    volumeId: string;
    issueNumber: string;
    skipCache: boolean;
  }>()
);

export const issueMetadataLoaded = createAction(
  '[Metadata] A scraping issue was loaded',
  props<{ issue: IssueMetadata }>()
);

export const loadIssueMetadataFailed = createAction(
  '[Metadata] Failed to load a scraping issue'
);

export const scrapeSingleComicBook = createAction(
  '[Metadata] Scrape the details for a comic',
  props<{
    metadataSource: MetadataSource;
    issueId: string;
    comic: ComicBook;
    skipCache: boolean;
  }>()
);

export const scrapeSingleComicBookSuccess = createAction(
  '[Metadata] The details for a comic were scraped'
);

export const scrapeSingleComicBookFailure = createAction(
  '[Metadata] Failed to scrape the details for a comic'
);

export const clearMetadataCache = createAction(
  '[Metadata] Clears the metadata cache'
);

export const clearMetadataCacheSuccess = createAction(
  '[Metadata] The metadata cache is cleared'
);

export const clearMetadataCacheFailure = createAction(
  '[Metadata] Failed to clear the metadata cache'
);

export const startMetadataUpdateProcess = createAction(
  '[Metadata] Start the metadata update process',
  props<{ skipCache: boolean }>()
);

export const startMetadataUpdateProcessSuccess = createAction(
  '[Metadata] Started the metadata update process'
);

export const startMetadataUpdateProcessFailure = createAction(
  '[Metadata] Failed to start metadata update process'
);
