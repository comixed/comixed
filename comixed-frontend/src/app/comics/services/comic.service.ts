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
  CLEAR_METADATA_URL,
  DELETE_COMIC_URL,
  GET_FORMATS_URL,
  GET_ISSUE_URL,
  GET_PAGE_TYPES_URL,
  GET_SCAN_TYPES_URL,
  RESTORE_COMIC_URL,
  SAVE_COMIC_URL,
  SCRAPE_COMIC_URL
} from 'app/comics/comics.constants';
import { Comic } from 'app/comics';
import { ComicScrapeRequest } from 'app/comics/models/net/comic-scrape-request';

@Injectable({
  providedIn: 'root'
})
export class ComicService {
  constructor(private http: HttpClient) {}

  getScanTypes(): Observable<any> {
    return this.http.get(interpolate(GET_SCAN_TYPES_URL));
  }

  getFormats(): Observable<any> {
    return this.http.get(interpolate(GET_FORMATS_URL));
  }

  getPageTypes(): Observable<any> {
    return this.http.get(interpolate(GET_PAGE_TYPES_URL));
  }

  getIssue(id: number): Observable<any> {
    return this.http.get(interpolate(GET_ISSUE_URL, { id: id }));
  }

  saveComic(comic: Comic): Observable<any> {
    return this.http.put(interpolate(SAVE_COMIC_URL, { id: comic.id }), comic);
  }

  clearMetadata(comic: Comic): Observable<any> {
    return this.http.delete(interpolate(CLEAR_METADATA_URL, { id: comic.id }));
  }

  deleteComic(comic: Comic): Observable<any> {
    return this.http.delete(interpolate(DELETE_COMIC_URL, { id: comic.id }));
  }

  restoreComic(comic: Comic): Observable<any> {
    return this.http.put(interpolate(RESTORE_COMIC_URL, { id: comic.id }), {});
  }

  scrapeComic(
    comic: Comic,
    apiKey: string,
    issueId: number,
    skipCache: boolean
  ): Observable<any> {
    return this.http.post(interpolate(SCRAPE_COMIC_URL), {
      comicId: comic.id,
      apiKey: apiKey,
      issueId: issueId,
      skipCache: skipCache
    } as ComicScrapeRequest);
  }
}
