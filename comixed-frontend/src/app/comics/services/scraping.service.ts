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
import { LoggerService } from '@angular-ru/logger';

@Injectable({
  providedIn: 'root'
})
export class ScrapingService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Fetches scraping volumes.
   *
   * @param apiKey the api key
   * @param series the series name
   * @param volume the series volume
   * @param maxRecords the maximum records to return
   * @param skipCache the skip cache flag
   */
  getVolumes(
    apiKey: string,
    series: string,
    volume: string,
    maxRecords: number,
    skipCache: boolean
  ): Observable<any> {
    this.logger.debug('[POST] http request: get volumes');
    return this.http.post(interpolate(GET_VOLUMES_URL), {
      apiKey: apiKey,
      series: series,
      volume: volume,
      maxRecords: maxRecords,
      skipCache: skipCache
    } as GetVolumesRequest);
  }

  /**
   * Fetches a single scraping issue.
   *
   * @param apiKey the api key
   * @param volumeId the scraping volume id
   * @param issueNumber the issue number
   * @param skipCache the skip cache flag
   */
  getIssue(
    apiKey: string,
    volumeId: number,
    issueNumber: string,
    skipCache: boolean
  ): Observable<any> {
    this.logger.debug(
      `[POST] http request: get scraping issue: apiKey=${apiKey} volumeId=${volumeId} issueNumber=${issueNumber} skipCache=${skipCache}`
    );
    return this.http.post(
      interpolate(GET_ISSUE_URL, { volume: `${volumeId}` }),
      {
        apiKey: apiKey,
        skipCache: skipCache,
        issueNumber: issueNumber
      } as GetScrapingIssueRequest
    );
  }

  /**
   * Scrapes a single comic.
   *
   * @param apiKey the api key
   * @param comicId the comic database id
   * @param issueId the scraping issue id
   * @param skipCache the skip cache flag
   */
  loadMetadata(
    apiKey: string,
    comicId: number,
    issueId: string,
    skipCache: boolean
  ): Observable<any> {
    this.logger.debug(
      `[POST] http request: load metadata: apiKey=${apiKey} comicId=${comicId} issueId=${issueId} skipCache=${skipCache}`
    );
    return this.http.post(
      interpolate(LOAD_METADATA_URL, { comicId: comicId, issueId: issueId }),
      {
        apiKey: apiKey,
        skipCache: skipCache
      } as LoadMetadataRequest
    );
  }
}
