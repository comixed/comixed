/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL,
  LOAD_FILENAME_SCRAPING_RULES_URL,
  SAVE_FILENAME_SCRAPING_RULES_URL,
  UPLOAD_FILENAME_SCRAPING_RULES_URL
} from '@app/admin/admin.constants';
import { interpolate } from '@app/core';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';

@Injectable({
  providedIn: 'root'
})
export class FilenameScrapingRulesService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  load(): Observable<any> {
    this.logger.trace('Loading filename scraping rules');
    return this.http.get(interpolate(LOAD_FILENAME_SCRAPING_RULES_URL));
  }

  save(args: { rules: FilenameScrapingRule[] }): Observable<any> {
    this.logger.trace('Saving filename scraping rules');
    return this.http.post(
      interpolate(SAVE_FILENAME_SCRAPING_RULES_URL),
      args.rules
    );
  }

  downloadFile(): Observable<any> {
    this.logger.trace('Downloading filename scraping fules file');
    return this.http.get(
      interpolate(DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL)
    );
  }

  uploadFile(args: { file: File }): Observable<any> {
    this.logger.trace('Uploading filename scraping rules:', args);
    const formData = new FormData();
    formData.append('file', args.file);
    return this.http.post(
      interpolate(UPLOAD_FILENAME_SCRAPING_RULES_URL),
      formData
    );
  }
}
