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

import { FilenameScrapingRuleService } from './filename-scraping-rule.service';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3
} from '@app/admin/admin.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  LOAD_FILENAME_SCRAPING_RULES_URL,
  SAVE_FILENAME_SCRAPING_RULES_URL
} from '@app/admin/admin.constants';

describe('FilenameScrapingRuleService', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];

  let service: FilenameScrapingRuleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });
    service = TestBed.inject(FilenameScrapingRuleService);
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
});
