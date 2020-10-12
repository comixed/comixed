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
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/logger';
import { LOAD_COMIC_FORMATS_URL } from 'app/comics/comics.constants';
import { interpolate } from 'app/app.functions';

/**
 * Provides methods for manipulating the described format for a comic archive.
 *
 * @author Darryl L. Pierce
 */
@Injectable({
  providedIn: 'root'
})
export class ComicFormatService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Retrieves the list of formats.
   */
  loadFormats(): Observable<any> {
    this.logger.debug('Service: loading comic formats');
    return this.http.get(interpolate(LOAD_COMIC_FORMATS_URL));
  }
}
