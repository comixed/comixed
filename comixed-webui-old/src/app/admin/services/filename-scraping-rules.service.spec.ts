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

import { TestBed } from '@angular/core/testing';

import { FilenameScrapingRulesService } from './filename-scraping-rules.service';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3,
  FILENAME_SCRAPING_RULES_FILE
} from '@app/admin/admin.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL,
  LOAD_FILENAME_SCRAPING_RULES_URL,
  SAVE_FILENAME_SCRAPING_RULES_URL,
  UPLOAD_FILENAME_SCRAPING_RULES_URL
} from '@app/admin/admin.constants';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('FilenameScrapingRulesService', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];
  const FILENAME_RULES_FILE = FILENAME_SCRAPING_RULES_FILE;
  const UPLOADED_FILE = new File([], 'testing');

  let service: FilenameScrapingRulesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FilenameScrapingRulesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load all filename scraping rules', () => {
    service.load().subscribe(response => expect(response).toEqual(RULES));

    const req = httpMock.expectOne(
      interpolate(LOAD_FILENAME_SCRAPING_RULES_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(RULES);
  });

  it('can save the filename scraping rules', () => {
    service
      .save({ rules: RULES })
      .subscribe(response => expect(response).toEqual(RULES));

    const req = httpMock.expectOne(
      interpolate(SAVE_FILENAME_SCRAPING_RULES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(RULES);
    req.flush(RULES);
  });

  it('can download the filename scraping rules', () => {
    service
      .downloadFile()
      .subscribe(response => expect(response).toBe(FILENAME_RULES_FILE));

    const req = httpMock.expectOne(
      interpolate(DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(FILENAME_RULES_FILE);
  });

  it('can upload a filename scraping rules file', () => {
    service
      .uploadFile({ file: UPLOADED_FILE })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(UPLOAD_FILENAME_SCRAPING_RULES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect((req.request.body as FormData).get('file')).toEqual(UPLOADED_FILE);
    req.flush(new HttpResponse({ status: 200 }));
  });
});
