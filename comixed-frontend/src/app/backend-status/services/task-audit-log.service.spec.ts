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

import { TaskAuditLogService } from './task-audit-log.service';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/backend-status.fixtures';
import { LoggerModule } from '@angular-ru/logger';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import {
  CLEAR_TASK_AUDIT_LOG_URL,
  GET_TASK_LOG_ENTRIES_URL
} from 'app/backend-status/backend-status.constants';
import { ApiResponse } from 'app/core';

describe('TaskAuditLogService', () => {
  const LAST_ENTRY_DATE = new Date().getTime();
  const LOG_ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_2,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
  ];

  let taskAuditLogService: TaskAuditLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [TaskAuditLogService]
    });

    taskAuditLogService = TestBed.get(TaskAuditLogService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(taskAuditLogService).toBeTruthy();
  });

  it('can get a list of log entries', () => {
    taskAuditLogService
      .getLogEntries(LAST_ENTRY_DATE)
      .subscribe(response => expect(response).toEqual(LOG_ENTRIES));

    const req = httpMock.expectOne(
      interpolate(GET_TASK_LOG_ENTRIES_URL, {
        timestamp: LAST_ENTRY_DATE
      })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(LOG_ENTRIES);
  });

  it('can clear the task audit log', () => {
    const success = Math.random() * 100 > 50;
    taskAuditLogService
      .clearAuditLog()
      .subscribe(response =>
        expect(response).toEqual({ success } as ApiResponse<void>)
      );

    const req = httpMock.expectOne(interpolate(CLEAR_TASK_AUDIT_LOG_URL));
    expect(req.request.method).toEqual('DELETE');
    req.flush({ success } as ApiResponse<void>);
  });
});
