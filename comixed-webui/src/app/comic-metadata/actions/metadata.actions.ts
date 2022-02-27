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
import { Comic } from '@app/comic-books/models/comic';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const resetMetadataState = createAction(
  '[Metadata] Resets the scraping state'
);

export const setChosenMetadataSource = createAction(
  '[Metadata] Sets the chosen metadata source',
  props<{ metadataSource: MetadataSource }>()
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
    volumeId: number;
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

export const scrapeComic = createAction(
  '[Metadata] Scrape the details for a comic',
  props<{
    metadataSource: MetadataSource;
    issueId: number;
    comic: Comic;
    skipCache: boolean;
  }>()
);

export const comicScraped = createAction(
  '[Metadata] The details for a comic were scraped'
);

export const scrapeComicFailed = createAction(
  '[Metadata] Failed to scrape the details for a comic'
);
