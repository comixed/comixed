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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { TestBed } from '@angular/core/testing';

import { RestAuditLogService } from './rest-audit-log.service';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/backend-status.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { ApiResponse } from 'app/core';
import { GetRestAuditLogEntriesResponse } from 'app/backend-status/models/net/get-rest-audit-log-entries-response';
import { interpolate } from 'app/app.functions';
import { GET_REST_AUDIT_LOG_ENTRIES_URL } from 'app/backend-status/backend-status.constants';

describe('RestAuditLogService', () => {
  const ENTRIES = [REST_AUDIT_LOG_ENTRY_1];
  const LATEST = new Date().getTime();

  let service: RestAuditLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.get(RestAuditLogService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get REST audit log entries', () => {
    const serviceResponse = {
      success: true,
      result: { entries: ENTRIES, latest: LATEST }
    } as ApiResponse<GetRestAuditLogEntriesResponse>;

    service
      .loadEntries(LATEST)
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(GET_REST_AUDIT_LOG_ENTRIES_URL, { cutoff: LATEST })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serviceResponse);
  });
});
