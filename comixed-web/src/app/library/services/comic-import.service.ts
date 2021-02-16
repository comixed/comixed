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

import { Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { Observable } from 'rxjs';
import { ComicFile } from '@app/library/models/comic-file';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import {
  LOAD_COMIC_FILES_URL,
  SEND_COMIC_FILES_URL
} from '@app/library/library.constants';
import { LoadComicFilesRequest } from '@app/library/models/net/load-comic-files-request';
import { SendComicFilesRequest } from '@app/library/models/net/send-comic-files-request';

@Injectable({
  providedIn: 'root'
})
export class ComicImportService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads comic files in the specified file system.
   * @param args.directory the root of the file system
   * @param args.maximum the maximum number of comics to return
   */
  loadComicFiles(args: {
    directory: string;
    maximum: number;
  }): Observable<any> {
    this.logger.debug('Service: load comic files:', args);
    return this.http.post(interpolate(LOAD_COMIC_FILES_URL), {
      directory: args.directory,
      maximum: args.maximum
    } as LoadComicFilesRequest);
  }

  /**
   * Sends the supplied comic files to the backend to be imported.
   * @param args.files the comic files
   * @param args.ignoreMetadata flag to ignore metadata
   * @param args.deleteBlockedPages flag to mark blocked page as deleted
   */
  sendComicFiles(args: {
    files: ComicFile[];
    ignoreMetadata: boolean;
    deleteBlockedPages: boolean;
  }): Observable<any> {
    this.logger.debug('Service: sending comic files:', args);
    return this.http.post(interpolate(SEND_COMIC_FILES_URL), {
      filenames: args.files.map(file => file.filename),
      ignoreMetadata: args.ignoreMetadata,
      deleteBlockedPages: args.deleteBlockedPages
    } as SendComicFilesRequest);
  }
}
