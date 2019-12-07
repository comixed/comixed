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

import { Action } from '@ngrx/store';
import { Comic } from 'app/comics';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';

export enum ScrapingActionTypes {
  Start = '[SCRAPE] Start scraping comics',
  GetVolumes = '[SCRAPE] Get the list of volumes for a comic',
  VolumesReceived = '[SCRAPE] The volumes returned for a comic',
  GetVolumesFailed = '[SCRAPE] Failed to get the list of volumes for a comic',
  GetIssue = '[SCRAPE] Get the selected issue for a given volume',
  IssueReceived = '[SCRAPE] Received the issue',
  GetIssueFailed = '[SCRAPE] Failed to get the requested issue',
  LoadMetadata = '[SCRAPE] Get the metadata for the comic',
  MetadataLoaded = '[SCRAPE] Successfully retrieved the metadata',
  LoadMetadataFailed = '[SCRAPE] Failed to get the metadata',
  SkipComic = '[SCRAPE] Skip over a comic',
  ResetVolumes = '[SCRAPE] Reset the list of volumes'
}

export class ScrapingStart implements Action {
  readonly type = ScrapingActionTypes.Start;

  constructor(public payload: { comics: Comic[] }) {}
}

export class ScrapingGetVolumes implements Action {
  readonly type = ScrapingActionTypes.GetVolumes;

  constructor(
    public payload: {
      apiKey: string;
      series: string;
      volume: string;
      skipCache: boolean;
    }
  ) {}
}

export class ScrapingVolumesReceived implements Action {
  readonly type = ScrapingActionTypes.VolumesReceived;

  constructor(public payload: { volumes: ScrapingVolume[] }) {}
}

export class ScrapingGetVolumesFailed implements Action {
  readonly type = ScrapingActionTypes.GetVolumesFailed;

  constructor() {}
}

export class ScrapingGetIssue implements Action {
  readonly type = ScrapingActionTypes.GetIssue;

  constructor(
    public payload: {
      apiKey: string;
      volumeId: number;
      issueNumber: string;
      skipCache: boolean;
    }
  ) {}
}

export class ScrapingIssueReceived implements Action {
  readonly type = ScrapingActionTypes.IssueReceived;

  constructor(public payload: { issue: ScrapingIssue }) {}
}

export class ScrapingGetIssueFailed implements Action {
  readonly type = ScrapingActionTypes.GetIssueFailed;

  constructor() {}
}

export class ScrapingLoadMetadata implements Action {
  readonly type = ScrapingActionTypes.LoadMetadata;

  constructor(
    public payload: {
      apiKey: string;
      comicId: number;
      issueNumber: string;
      skipCache: boolean;
    }
  ) {}
}

export class ScrapingMetadataLoaded implements Action {
  readonly type = ScrapingActionTypes.MetadataLoaded;

  constructor(public payload: { comic: Comic }) {}
}

export class ScrapingLoadMetadataFailed implements Action {
  readonly type = ScrapingActionTypes.LoadMetadataFailed;

  constructor() {}
}

export class ScrapingSkipComic implements Action {
  readonly type = ScrapingActionTypes.SkipComic;

  constructor(public payload: { comic: Comic }) {}
}

export class ScrapingResetVolumes implements Action {
  readonly type = ScrapingActionTypes.ResetVolumes;

  constructor() {}
}

export type ScrapingActions =
  | ScrapingStart
  | ScrapingGetVolumes
  | ScrapingVolumesReceived
  | ScrapingGetVolumesFailed
  | ScrapingGetIssue
  | ScrapingIssueReceived
  | ScrapingGetIssueFailed
  | ScrapingLoadMetadata
  | ScrapingMetadataLoaded
  | ScrapingLoadMetadataFailed
  | ScrapingSkipComic
  | ScrapingResetVolumes;
