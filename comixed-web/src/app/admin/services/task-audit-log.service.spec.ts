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

import { TaskAuditLogService } from './task-audit-log.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_5
} from '@app/admin/admin.fixtures';
import { LoggerModule } from '@angular-ru/logger';
import { LoadTaskAuditLogEntriesResponse } from '@app/admin/models/net/load-task-audit-log-entries-response';
import { interpolate } from '@app/core';
import {
  LOAD_TASK_AUDIT_LOG_ENTRIES_URL,
  MAXIMUM_TASK_AUDIT_LOG_RECORDS
} from '@app/admin/admin.constants';
import { LoadTaskAuditLogEntriesRequest } from '@app/admin/models/net/load-task-audit-log-entries-request';

describe('TaskAuditLogService', () => {
  const ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_5
  ];
  const ENTRY = TASK_AUDIT_LOG_ENTRY_2;
  const LATEST = Math.abs(Math.ceil(Math.random() * 1000));

  let service: TaskAuditLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(TaskAuditLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load entries', () => {
    const serviceResponse = {
      entries: ENTRIES,
      latest: LATEST,
      lastPage: Math.random() > 0.5
    } as LoadTaskAuditLogEntriesResponse;

    service
      .loadEntries({ latest: LATEST })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(LOAD_TASK_AUDIT_LOG_ENTRIES_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      latest: LATEST,
      maximum: MAXIMUM_TASK_AUDIT_LOG_RECORDS
    } as LoadTaskAuditLogEntriesRequest);
    req.flush(serviceResponse);
  });
});
