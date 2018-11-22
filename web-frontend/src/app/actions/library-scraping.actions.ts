/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Comic } from '../models/comic.model';
import { Volume } from '../models/volume.model';
import { ComicIssue } from '../models/comic-issue.model';

export const LIBRARY_SCRAPING_SETUP = '[LIBRARY SCRAPING] Setup scraping';
export const LIBRARY_SCRAPING_SAVE_LOCAL_CHANGES = '[LIBRARY SCRAPING] Save local changes';
export const LIBRARY_SCRAPING_FETCH_VOLUMES = '[LIBRARY SCRAPING] Fetch volumes';
export const LIBRARY_SCRAPING_FOUND_VOLUMES = '[LIBRARY SCRAPING] Found volumes';
export const LIBRARY_SCRAPING_SET_CURRENT_VOLUME = '[LIBRARY SCRAPING] Set current volume';
export const LIBRARY_SCRAPING_FETCH_ISSUES = '[LIBRARY SCRAPING] Fetch issues';
export const LIBRARY_SCRAPING_FOUND_ISSUE = '[LIBRARY SCRAPING] Found issue';
export const LIBRARY_SCRAPING_SCRAPE_METADATA = '[LIBRARY SCRAPING] Scrape metadata';

export class LibraryScrapingSetup implements Action {
  readonly type = LIBRARY_SCRAPING_SETUP;

  constructor(public payload: {
    api_key: string,
    comic: Comic,
    series: string,
    volume: string,
    issue_number: string,
  }) { }
}

export class LibraryScrapingSaveLocalChanges implements Action {
  readonly type = LIBRARY_SCRAPING_SAVE_LOCAL_CHANGES;

  constructor(public payload: {
    api_key: string,
    comic: Comic,
    series: string,
    volume: string,
    issue_number: string,
  }) { }
}

export class LibraryScrapingFetchVolumes implements Action {
  readonly type = LIBRARY_SCRAPING_FETCH_VOLUMES;

  constructor(public payload: {
    api_key: string,
    series: string,
    volume: string,
    issue_number: string,
  }) { }
}

export class LibraryScrapingFoundVolumes implements Action {
  readonly type = LIBRARY_SCRAPING_FOUND_VOLUMES;

  constructor(public payload: Array<Volume>) { }
}

export class LibraryScrapingSetCurrentVolume implements Action {
  readonly type = LIBRARY_SCRAPING_SET_CURRENT_VOLUME;

  constructor(public payload: {
    api_key: string,
    volume: Volume,
    issue_number: string,
  }) { }
}

export class LibraryScrapingFetchIssue implements Action {
  readonly type = LIBRARY_SCRAPING_FETCH_ISSUES;

  constructor(public payload: {
    api_key: string,
    volume_id: number,
    issue_number: string,
  }) { }
}

export class LibraryScrapingFoundIssue implements Action {
  readonly type = LIBRARY_SCRAPING_FOUND_ISSUE;

  constructor(public payload: {
    issue: ComicIssue,
    volume_id: number,
  }) { }
}

export class LibraryScrapingScrapeMetadata implements Action {
  readonly type = LIBRARY_SCRAPING_SCRAPE_METADATA;

  constructor(public payload: {
    api_key: string,
    comic: Comic,
    issue_id: number,
  }) { }
}

export type Actions =
  LibraryScrapingSetup |
  LibraryScrapingSaveLocalChanges |
  LibraryScrapingFetchVolumes |
  LibraryScrapingFoundVolumes |
  LibraryScrapingSetCurrentVolume |
  LibraryScrapingFetchIssue |
  LibraryScrapingFoundIssue |
  LibraryScrapingScrapeMetadata;
