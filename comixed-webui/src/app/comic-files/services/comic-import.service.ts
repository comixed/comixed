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

import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/core';
import { LoadComicFilesRequest } from '@app/library/models/net/load-comic-files-request';
import { ImportComicFilesRequest } from '@app/library/models/net/import-comic-files-request';
import {
  LOAD_COMIC_FILES_FROM_SESSION_URL,
  LOAD_COMIC_FILES_URL,
  SCRAPE_FILENAME_URL,
  SEND_COMIC_FILES_URL,
  TOGGLE_COMIC_FILE_SELECTIONS_URL
} from '@app/comic-files/comic-file.constants';
import { FilenameMetadataRequest } from '@app/comic-files/models/net/filename-metadata-request';
import { ToggleComicFileSelectionsRequest } from '@app/comic-files/models/net/toggle-comic-file-selections-request';

@Injectable({
  providedIn: 'root'
})
export class ComicImportService {
  logger = inject(LoggerService);
  http = inject(HttpClient);

  /**
   * Loads comic files from the user's session.
   */
  loadComicFilesFromSession(): Observable<any> {
    this.logger.debug('Load comic files from user session');
    return this.http.get(interpolate(LOAD_COMIC_FILES_FROM_SESSION_URL));
  }

  /**
   * Loads comic files in the specified file system.
   * @param args.directory the root of the file system
   * @param args.maximum the maximum number of comics to return
   */
  loadComicFiles(args: {
    directory: string;
    maximum: number;
  }): Observable<any> {
    this.logger.debug('Load comic files:', args);
    return this.http.post(interpolate(LOAD_COMIC_FILES_URL), {
      directory: args.directory,
      maximum: args.maximum
    } as LoadComicFilesRequest);
  }

  toggleComicFileSelections(args: {
    filename: string;
    selected: boolean;
  }): Observable<any> {
    this.logger.debug('Toggling comic file selections:', args);
    return this.http.post(interpolate(TOGGLE_COMIC_FILE_SELECTIONS_URL), {
      filename: args.filename,
      selected: args.selected
    } as ToggleComicFileSelectionsRequest);
  }

  /**
   * Sends the supplied comic files to the backend to be imported.
   */
  sendComicFiles(): Observable<any> {
    this.logger.debug('Sending comic files');
    return this.http.post(
      interpolate(SEND_COMIC_FILES_URL),
      {} as ImportComicFilesRequest
    );
  }

  scrapeFilename(args: { filename: string }): Observable<any> {
    this.logger.debug('Scrape filename:', args);
    return this.http.post(interpolate(SCRAPE_FILENAME_URL), {
      filename: args.filename
    } as FilenameMetadataRequest);
  }
}
