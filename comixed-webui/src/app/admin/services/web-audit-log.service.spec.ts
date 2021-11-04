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

import { WebAuditLogService } from './web-audit-log.service';
import {
  WEB_AUDIT_LOG_ENTRY_1,
  WEB_AUDIT_LOG_ENTRY_2,
  WEB_AUDIT_LOG_ENTRY_3
} from '@app/admin/admin.fixtures';
import { LoadWebAuditLogEntriesResponse } from '@app/admin/models/net/load-web-audit-log-entries-response';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  CLEAR_WEB_AUDIT_LOG_ENTRIES_URL,
  LOAD_WEB_AUDIT_LOG_ENTRIES_URL
} from '@app/admin/admin.constants';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { HttpResponse } from '@angular/common/http';

describe('WebAuditLogService', () => {
  const ENTRIES = [
    WEB_AUDIT_LOG_ENTRY_1,
    WEB_AUDIT_LOG_ENTRY_2,
    WEB_AUDIT_LOG_ENTRY_3
  ];
  const TIMESTAMP = new Date().getTime();

  let service: WebAuditLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), HttpClientTestingModule]
    });

    service = TestBed.inject(WebAuditLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load log entries', () => {
    const serviceResponse = {
      entries: ENTRIES,
      latest: TIMESTAMP
    } as LoadWebAuditLogEntriesResponse;

    service
      .load({ timestamp: TIMESTAMP })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_WEB_AUDIT_LOG_ENTRIES_URL, { timestamp: TIMESTAMP })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serviceResponse);
  });

  it('can clear the web audit log', () => {
    service
      .clear()
      .subscribe(response =>
        expect(response).toEqual(new HttpResponse({ status: 200 }))
      );

    const req = httpMock.expectOne(
      interpolate(CLEAR_WEB_AUDIT_LOG_ENTRIES_URL)
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });
});
