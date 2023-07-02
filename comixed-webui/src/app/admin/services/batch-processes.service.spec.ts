/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { BatchProcessesService } from './batch-processes.service';
import {
  BATCH_PROCESS_STATUS_1,
  BATCH_PROCESS_STATUS_2,
  BATCH_PROCESS_STATUS_3,
  BATCH_PROCESS_STATUS_4,
  BATCH_PROCESS_STATUS_5
} from '@app/admin/admin.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import { GET_ALL_BATCH_PROCESSES_URL } from '@app/admin/admin.constants';

describe('BatchProcessesService', () => {
  const ENTRIES = [
    BATCH_PROCESS_STATUS_1,
    BATCH_PROCESS_STATUS_2,
    BATCH_PROCESS_STATUS_3,
    BATCH_PROCESS_STATUS_4,
    BATCH_PROCESS_STATUS_5
  ];

  let service: BatchProcessesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(BatchProcessesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the list of batch processes', () => {
    service.getAll().subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(interpolate(GET_ALL_BATCH_PROCESSES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(ENTRIES);
  });
});
