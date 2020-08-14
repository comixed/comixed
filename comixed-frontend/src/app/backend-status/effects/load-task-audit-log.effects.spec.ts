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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { LoadTaskAuditLogEffects } from './load-task-audit-log.effects';
import { TaskAuditLogService } from 'app/backend-status/services/task-audit-log.service';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_4,
  TASK_AUDIT_LOG_ENTRY_5
} from 'app/backend-status/backend-status.fixtures';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogFailed,
  taskAuditLogEntriesLoaded
} from 'app/backend-status/actions/load-task-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { AlertService, ApiResponse } from 'app/core';
import { TaskAuditLogEntry } from 'app/backend-status/models/task-audit-log-entry';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from 'app/core/core.module';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadTaskAuditLogResponse } from 'app/backend-status/models/net/load-task-audit-log-response';
import { MessageService } from 'primeng/api';

describe('LoadTaskAuditLogEffects', () => {
  const LATEST = new Date().getTime();
  const LOG_ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_2,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_4,
    TASK_AUDIT_LOG_ENTRY_5
  ];

  let actions$: Observable<any>;
  let effects: LoadTaskAuditLogEffects;
  let taskAuditLogService: jasmine.SpyObj<TaskAuditLogService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        LoadTaskAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: TaskAuditLogService,
          useValue: {
            getLogEntries: jasmine.createSpy(
              'TaskAuditLogService.getLogEntries()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<LoadTaskAuditLogEffects>(LoadTaskAuditLogEffects);
    taskAuditLogService = TestBed.get(TaskAuditLogService);
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the task audit log entries', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true,
        result: {
          entries: LOG_ENTRIES,
          latest: LATEST
        } as LoadTaskAuditLogResponse
      } as ApiResponse<LoadTaskAuditLogResponse>;
      const action = loadTaskAuditLogEntries({ since: 0 });
      const outcome = taskAuditLogEntriesLoaded({
        entries: LOG_ENTRIES,
        latest: LATEST
      });

      actions$ = hot('-a', { a: action });
      taskAuditLogService.getLogEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadTaskAuditLogEntries$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse = {
        success: false
      } as ApiResponse<TaskAuditLogEntry[]>;
      const action = loadTaskAuditLogEntries({ since: 0 });
      const outcome = loadTaskAuditLogFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.getLogEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadTaskAuditLogEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadTaskAuditLogEntries({ since: 0 });
      const outcome = loadTaskAuditLogFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.getLogEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadTaskAuditLogEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadTaskAuditLogEntries({ since: 0 });
      const outcome = loadTaskAuditLogFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.getLogEntries.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadTaskAuditLogEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
