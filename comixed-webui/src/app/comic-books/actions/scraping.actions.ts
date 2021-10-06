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
import { ScrapingVolume } from '../models/scraping-volume';
import { ScrapingIssue } from '../models/scraping-issue';
import { Comic } from '@app/comic-books/models/comic';

export const resetScraping = createAction(
  '[Scraping] Resets the scraping state'
);

export const loadScrapingVolumes = createAction(
  '[Scraping] Loads scraping volumes',
  props<{
    apiKey: string;
    series: string;
    maximumRecords: number;
    skipCache: boolean;
  }>()
);

export const scrapingVolumesLoaded = createAction(
  '[Scraping] Received scraping volumes',
  props<{ volumes: ScrapingVolume[] }>()
);

export const loadScrapingVolumesFailed = createAction(
  '[Scraping] Failed to load scraping volumes'
);

export const loadScrapingIssue = createAction(
  '[Scraping] Load a scraping issue',
  props<{
    apiKey: string;
    volumeId: number;
    issueNumber: string;
    skipCache: boolean;
  }>()
);

export const scrapingIssueLoaded = createAction(
  '[Scraping] A scraping issue was loaded',
  props<{ issue: ScrapingIssue }>()
);

export const loadScrapingIssueFailed = createAction(
  '[Scraping] Failed to load a scraping issue'
);

export const scrapeComic = createAction(
  '[Scraping] Scrape the details for a comic',
  props<{ apiKey: string; issueId: number; comic: Comic; skipCache: boolean }>()
);

export const comicScraped = createAction(
  '[Scraping] The details for a comic were scraped'
);

export const scrapeComicFailed = createAction(
  '[Scraping] Failed to scrape the details for a comic'
);
