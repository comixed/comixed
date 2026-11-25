/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from '@app/app-functions';
import {
  DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL,
  LOAD_FILENAME_SCRAPING_RULES_URL,
  SAVE_FILENAME_SCRAPING_RULES_URL,
  UPLOAD_FILENAME_SCRAPING_RULES_URL
} from '@app/metadata/metadata-constants';
import { FilenameScrapingRule } from '@app/metadata/models/filename-scraping-rule';
import { Observable } from 'rxjs';
import { DownloadDocument } from '@app/file-transfers/models/download-document';

@Service()
export class FilenameScrapingRulesService {
  readonly logger = inject(LoggerService);
  readonly http = inject(HttpClient);

  loadRules(): Observable<FilenameScrapingRule[]> {
    this.logger.debug('Loading filename scraping rules');
    return this.http.get<FilenameScrapingRule[]>(
      interpolate(LOAD_FILENAME_SCRAPING_RULES_URL)
    );
  }

  saveRules(args: {
    rules: FilenameScrapingRule[];
  }): Observable<FilenameScrapingRule[]> {
    this.logger.debug('Saving filename scraping rules:', args);
    return this.http.post<FilenameScrapingRule[]>(
      interpolate(SAVE_FILENAME_SCRAPING_RULES_URL),
      args.rules
    );
  }

  downloadRules(): Observable<DownloadDocument> {
    this.logger.debug('Downloading filename scraping rules');
    return this.http.get<DownloadDocument>(
      interpolate(DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL)
    );
  }

  uploadRules(args: { file: File }): Observable<FilenameScrapingRule[]> {
    this.logger.debug('Uploading filename scraping rules file:', args);
    const formData = new FormData();
    formData.append('file', args.file);
    return this.http.post<FilenameScrapingRule[]>(
      interpolate(UPLOAD_FILENAME_SCRAPING_RULES_URL),
      formData
    );
  }
}
