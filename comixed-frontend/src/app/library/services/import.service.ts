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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { interpolate } from 'app/app.functions';
import { GET_COMIC_FILES_URL, IMPORT_COMIC_FILES_URL } from 'app/app.constants';
import { ComicFile } from '../models/comic-file';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  constructor(private http: HttpClient) {}

  get_comic_files(directory: string): Observable<any> {
    return this.http.get(
      interpolate(GET_COMIC_FILES_URL, { directory: encodeURI(directory) })
    );
  }

  import_comic_files(
    comic_files: ComicFile[],
    delete_blocked_pages: boolean,
    ignore_metadata: boolean
  ): Observable<any> {
    return this.http.post(interpolate(IMPORT_COMIC_FILES_URL), {
      filenames: comic_files.map(comic_file => comic_file.filename),
      delete_blocked_pages: delete_blocked_pages,
      ignore_metadata: ignore_metadata
    });
  }
}
