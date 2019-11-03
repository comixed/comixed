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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { interpolate } from 'app/app.functions';
import {
  GET_ISSUE_URL,
  GET_VOLUMES_URL,
  LOAD_METADATA_URL
} from 'app/comics/comics.constants';
import { GetVolumesRequest } from 'app/comics/models/net/get-volumes-request';
import { GetScrapingIssueRequest } from 'app/comics/models/net/get-scraping-issue-request';
import { LoadMetadataRequest } from 'app/comics/models/net/load-metadata-request';

@Injectable({
  providedIn: 'root'
})
export class ScrapingService {
  constructor(private http: HttpClient) {}

  getVolumes(
    apiKey: string,
    series: string,
    volume: string,
    skipCache: boolean
  ): Observable<any> {
    return this.http.post(interpolate(GET_VOLUMES_URL, { series: series }), {
      apiKey: apiKey,
      series: series,
      volume: volume,
      skipCache: skipCache
    } as GetVolumesRequest);
  }

  getIssue(
    apiKey: string,
    volumeId: number,
    issueId: string,
    skipCache: boolean
  ): Observable<any> {
    return this.http.post(
      interpolate(GET_ISSUE_URL, { volume: `${volumeId}`, issue: issueId }),
      {
        apiKey: apiKey,
        skipCache: skipCache
      } as GetScrapingIssueRequest
    );
  }

  loadMetadata(
    apiKey: string,
    comicId: number,
    issueId: string,
    skipCache: boolean
  ): Observable<any> {
    return this.http.post(
      interpolate(LOAD_METADATA_URL, { comicId: comicId, issueId: issueId }),
      {
        apiKey: apiKey,
        skipCache: skipCache
      } as LoadMetadataRequest
    );
  }
}
