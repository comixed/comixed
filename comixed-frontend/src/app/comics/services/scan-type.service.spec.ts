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

import { TestBed } from '@angular/core/testing';

import { ScanTypeService } from './scan-type.service';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from 'app/comics/comics.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ApiResponse } from 'app/core';
import { ScanType } from 'app/comics';
import { interpolate } from 'app/app.functions';
import { GET_SCAN_TYPES_URL } from 'app/comics/comics.constants';
import { LoggerModule } from '@angular-ru/logger';

describe('ScanTypeService', () => {
  const SCAN_TYPES = [
    SCAN_TYPE_1,
    SCAN_TYPE_2,
    SCAN_TYPE_3,
    SCAN_TYPE_4,
    SCAN_TYPE_5
  ];

  let service: ScanTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [ScanTypeService]
    });

    service = TestBed.get(ScanTypeService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get the set of scan types', () => {
    const RESPONSE = { success: true, result: SCAN_TYPES } as ApiResponse<
      ScanType[]
    >;

    service.getAll().subscribe(response => expect(response).toEqual(RESPONSE));

    const req = httpMock.expectOne(interpolate(GET_SCAN_TYPES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(RESPONSE);
  });
});
