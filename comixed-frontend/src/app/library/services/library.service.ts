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

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interpolate } from 'app/app.functions';
import { GetLibraryUpdatesRequest } from 'app/library/models/net/get-library-updates-request';
import { LoggerService } from '@angular-ru/logger';
import { Observable } from 'rxjs';
import {
  CLEAR_IMAGE_CACHE_URL,
  CONSOLIDATE_LIBRARY_URL,
  CONVERT_COMICS_URL,
  DELETE_MULTIPLE_COMICS_URL,
  GET_LIBRARY_UPDATES_URL,
  START_RESCAN_URL,
  UNDELETE_MULTIPLE_COMICS_URL
} from 'app/library/library.constants';
import { ConvertComicsRequest } from 'app/library/models/net/convert-comics-request';
import { Comic } from 'app/comics';
import { ConsolidateLibraryRequest } from 'app/library/models/net/consolidate-library-request';
import { UndeleteMultipleComicsRequest } from 'app/library/models/net/undelete-multiple-comics-request';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

  getUpdatesSince(
    lastUpdateDate: Date,
    lastComicId: number,
    maximumComics: number,
    processingCount: number,
    timeout: number
  ): Observable<any> {
    this.logger.debug(
      `[POST] http request: getting comic updates: lastUpdateDate=${lastUpdateDate} lastComicId=${lastComicId} maximumComics=${maximumComics}`
    );
    return this.http.post(interpolate(GET_LIBRARY_UPDATES_URL), {
      lastUpdatedDate: lastUpdateDate.getTime(),
      lastComicId: lastComicId,
      maximumComics: maximumComics,
      processingCount: processingCount,
      timeout: timeout
    } as GetLibraryUpdatesRequest);
  }

  startRescan(): Observable<any> {
    this.logger.debug('[POST] http request: starting rescan');
    return this.http.post(interpolate(START_RESCAN_URL), { start: true });
  }

  deleteMultipleComics(ids: number[]): Observable<any> {
    this.logger.debug('[POST] http request: deleting multiple comics:', ids);
    const params = new HttpParams().set('comic_ids', ids.toString());
    return this.http.post(interpolate(DELETE_MULTIPLE_COMICS_URL), params);
  }

  undeleteMultipleComics(ids: number[]): Observable<any> {
    this.logger.debug('[POST] http request: undelete multiple comics:', ids);
    return this.http.post(interpolate(UNDELETE_MULTIPLE_COMICS_URL), {
      ids: ids
    } as UndeleteMultipleComicsRequest);
  }

  convertComics(
    comics: Comic[],
    archiveType: string,
    renamePages: boolean,
    deletePages: boolean,
    deleteOriginal: boolean
  ): Observable<any> {
    this.logger.debug(
      '[POST] http request: converting comics:',
      comics,
      archiveType,
      renamePages,
      deletePages,
      deleteOriginal
    );
    return this.http.post(interpolate(CONVERT_COMICS_URL), {
      ids: comics.map(comic => comic.id),
      archiveType: archiveType,
      renamePages: renamePages,
      deletePages: deletePages,
      deleteOriginal: deleteOriginal
    } as ConvertComicsRequest);
  }

  /**
   * Notifies the server to begin moving the entire library.
   *
   * @param deletePhysicalFiles the delete physical files flag
   * @param targetDirectory the target directory
   * @param renamingRule the renaming rules
   */
  moveComics(
    deletePhysicalFiles: boolean,
    targetDirectory: string,
    renamingRule: string
  ): Observable<any> {
    this.logger.debug('[POST] http request consolidate library:');
    this.logger.debug(`  deletePhysicalFiles=${deletePhysicalFiles}`);
    this.logger.debug(`  targetDirectory=${targetDirectory}`);
    this.logger.debug(`  renamingRule=${renamingRule}`);
    return this.http.post(interpolate(CONSOLIDATE_LIBRARY_URL), {
      deletePhysicalFiles: deletePhysicalFiles,
      targetDirectory: targetDirectory,
      renamingRule: renamingRule
    } as ConsolidateLibraryRequest);
  }

  clearImageCache(): Observable<any> {
    this.logger.debug('[DELETE] jhttp request: clear image cache');
    return this.http.delete(interpolate(CLEAR_IMAGE_CACHE_URL));
  }
}
