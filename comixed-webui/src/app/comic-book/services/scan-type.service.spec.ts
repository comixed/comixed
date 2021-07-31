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
import { ScanTypeService } from './scan-type.service';
import { LoggerModule } from '@angular-ru/logger';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3
} from '@app/comic-book/comic-book.fixtures';
import { LOAD_SCAN_TYPES_URL } from '@app/comic-book/comic-book.constants';
import { interpolate } from '@app/core';

describe('ScanTypeService', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_2, SCAN_TYPE_3];

  let service: ScanTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ScanTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load all scan types', () => {
    service
      .loadScanTypes()
      .subscribe(response => expect(response).toEqual(SCAN_TYPES));

    const req = httpMock.expectOne(interpolate(LOAD_SCAN_TYPES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(SCAN_TYPES);
  });
});
