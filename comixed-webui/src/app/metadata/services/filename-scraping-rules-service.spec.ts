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

import { TestBed } from '@angular/core/testing';
import { FilenameScrapingRulesService } from './filename-scraping-rules-service';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2
} from '@app/metadata/metadata-fixtures';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL,
  LOAD_FILENAME_SCRAPING_RULES_URL,
  SAVE_FILENAME_SCRAPING_RULES_URL,
  UPLOAD_FILENAME_SCRAPING_RULES_URL
} from '@app/metadata/metadata-constants';
import { interpolate } from '@app/app-functions';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideHttpClient } from '@angular/common/http';
import { DownloadDocument } from '@app/file-transfers/models/download-document';

describe('FilenameScrapingRulesService', () => {
  const TEST_FILENAME_SCRAPING_RULE_LIST = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2
  ];
  const TEST_RULES_FILE = new File([], 'testing');

  let service: FilenameScrapingRulesService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(FilenameScrapingRulesService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the list of rules', () => {
    const serverResponse = TEST_FILENAME_SCRAPING_RULE_LIST;

    service.loadRules().subscribe({
      next: response =>
        expect(response).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST)
    });

    const req = httpController.expectOne(
      interpolate(LOAD_FILENAME_SCRAPING_RULES_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should save a list of rules', () => {
    const serverResponse = TEST_FILENAME_SCRAPING_RULE_LIST.reverse();

    service.saveRules({ rules: TEST_FILENAME_SCRAPING_RULE_LIST }).subscribe({
      next: response =>
        expect(response).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST.reverse())
    });

    const req = httpController.expectOne(
      interpolate(SAVE_FILENAME_SCRAPING_RULES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should download a rules file', () => {
    const serverResponse = {
      filename: 'filename.cxrules',
      mediaType: 'appplication.csv',
      content: 'the content'
    } as DownloadDocument;

    service.downloadRules().subscribe({
      next: response => expect(response).toEqual(serverResponse)
    });

    const req = httpController.expectOne(
      interpolate(DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should upload a rules file', () => {
    const serverResponse = TEST_FILENAME_SCRAPING_RULE_LIST;

    service.uploadRules({ file: TEST_RULES_FILE }).subscribe({
      next: response =>
        expect(response).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST)
    });

    const req = httpController.expectOne(
      interpolate(UPLOAD_FILENAME_SCRAPING_RULES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect((req.request.body as FormData).get('file')).toEqual(TEST_RULES_FILE);
    req.flush(serverResponse);
    httpController.verify();
  });
});
