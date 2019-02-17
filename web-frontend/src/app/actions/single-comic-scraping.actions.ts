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

import { Injectable } from "@angular/core";
import { Action } from "@ngrx/store";
import { Comic } from "../models/comics/comic";
import { Volume } from "../models/comics/volume";
import { Issue } from "../models/scraping/issue";

export const SINGLE_COMIC_SCRAPING_SETUP = "[LIBRARY SCRAPING] Setup scraping";
export class SingleComicScrapingSetup implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_SETUP;

  constructor(
    public payload: {
      api_key: string;
      comic: Comic;
      series: string;
      volume: string;
      issue_number: string;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_SAVE_LOCAL_CHANGES =
  "[LIBRARY SCRAPING] Save local changes";
export class SingleComicScrapingSaveLocalChanges implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_SAVE_LOCAL_CHANGES;

  constructor(
    public payload: {
      api_key: string;
      comic: Comic;
      series: string;
      volume: string;
      issue_number: string;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_FETCH_VOLUMES =
  "[LIBRARY SCRAPING] Fetch volumes";
export class SingleComicScrapingFetchVolumes implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_FETCH_VOLUMES;

  constructor(
    public payload: {
      api_key: string;
      series: string;
      volume: string;
      issue_number: string;
      skip_cache: boolean;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_RESET_VOLUMES =
  "[LIBRARY SCRAPING] Reset volumes";
export class SingleComicScrapingResetVolumes implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_RESET_VOLUMES;

  constructor() {}
}

export const SINGLE_COMIC_SCRAPING_FOUND_VOLUMES =
  "[LIBRARY SCRAPING] Found volumes";
export class SingleComicScrapingFoundVolumes implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_FOUND_VOLUMES;

  constructor(public payload: Array<Volume>) {}
}

export const SINGLE_COMIC_SCRAPING_SET_CURRENT_VOLUME =
  "[LIBRARY SCRAPING] Set current volume";
export class SingleComicScrapingSetCurrentVolume implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_SET_CURRENT_VOLUME;

  constructor(
    public payload: {
      api_key: string;
      volume: Volume;
      issue_number: string;
      skip_cache: boolean;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_CLEAR_CURRENT_VOLUME =
  "[LIBRARY SCRAPING] Clear current volume";
export class SingleComicScrapingClearCurrentVolume implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_CLEAR_CURRENT_VOLUME;

  constructor() {}
}

export const SINGLE_COMIC_SCRAPING_FETCH_ISSUES =
  "[LIBRARY SCRAPING] Fetch issues";
export class SingleComicScrapingFetchIssue implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_FETCH_ISSUES;

  constructor(
    public payload: {
      api_key: string;
      volume_id: number;
      issue_number: string;
      skip_cache: boolean;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_FOUND_ISSUE =
  "[LIBRARY SCRAPING] Found issue";
export class SingleComicScrapingFoundIssue implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_FOUND_ISSUE;

  constructor(
    public payload: {
      issue: Issue;
      volume_id: number;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_SCRAPE_METADATA =
  "[LIBRARY SCRAPING] Scrape metadata";
export class SingleComicScrapingScrapeMetadata implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_SCRAPE_METADATA;

  constructor(
    public payload: {
      api_key: string;
      comic: Comic;
      issue_id: number;
      skip_cache: boolean;
      multi_comic_mode: boolean;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_METADATA_SCRAPED =
  "[LIBRARY SCRAPING] Metadata scraped";
export class SingleComicScrapingMetadataScraped implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_METADATA_SCRAPED;

  constructor(
    public payload: {
      original: Comic;
      updated: Comic;
      multi_comic_mode: boolean;
    }
  ) {}
}

export const SINGLE_COMIC_SCRAPING_CLEAR_DATA_SCRAPED_FLAG =
  "[LIBRARY SCRAPING] Clear the data changed flag";
export class SingleComicScrapingClearDataScrapedFlag implements Action {
  readonly type = SINGLE_COMIC_SCRAPING_CLEAR_DATA_SCRAPED_FLAG;

  constructor() {}
}

export type Actions =
  | SingleComicScrapingSetup
  | SingleComicScrapingSaveLocalChanges
  | SingleComicScrapingFetchVolumes
  | SingleComicScrapingResetVolumes
  | SingleComicScrapingFoundVolumes
  | SingleComicScrapingSetCurrentVolume
  | SingleComicScrapingClearCurrentVolume
  | SingleComicScrapingFetchIssue
  | SingleComicScrapingFoundIssue
  | SingleComicScrapingScrapeMetadata
  | SingleComicScrapingMetadataScraped
  | SingleComicScrapingClearDataScrapedFlag;
