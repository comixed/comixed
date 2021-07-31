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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { TaskAuditLogEffects } from './task-audit-log.effects';
import { TaskAuditLogService } from '@app/admin/services/task-audit-log.service';
import { LoggerModule } from '@angular-ru/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  TASK_AUDIT_LOG_ENTRY_1,
  TASK_AUDIT_LOG_ENTRY_2,
  TASK_AUDIT_LOG_ENTRY_3,
  TASK_AUDIT_LOG_ENTRY_5
} from '@app/admin/admin.fixtures';
import { LoadTaskAuditLogEntriesResponse } from '@app/admin/models/net/load-task-audit-log-entries-response';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogEntriesFailed,
  taskAuditLogEntriesLoaded
} from '@app/admin/actions/task-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('TaskAuditLogEffects', () => {
  const ENTRIES = [
    TASK_AUDIT_LOG_ENTRY_1,
    TASK_AUDIT_LOG_ENTRY_3,
    TASK_AUDIT_LOG_ENTRY_5
  ];
  const LATEST = Math.abs(Math.ceil(Math.random() * 1000));
  const LAST_PAGE = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: TaskAuditLogEffects;
  let taskAuditLogService: jasmine.SpyObj<TaskAuditLogService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        TaskAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: TaskAuditLogService,
          useValue: {
            loadEntries: jasmine.createSpy('TaskAuditLogService.loadEntries()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(TaskAuditLogEffects);
    taskAuditLogService = TestBed.inject(
      TaskAuditLogService
    ) as jasmine.SpyObj<TaskAuditLogService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading task audit log entries', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        entries: ENTRIES,
        latest: LATEST,
        lastPage: LAST_PAGE
      } as LoadTaskAuditLogEntriesResponse;
      const action = loadTaskAuditLogEntries({ latest: LATEST });
      const outcome = taskAuditLogEntriesLoaded({
        entries: ENTRIES,
        latest: LATEST,
        lastPage: LAST_PAGE
      });

      actions$ = hot('-a', { a: action });
      taskAuditLogService.loadEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadEntries$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadTaskAuditLogEntries({ latest: LATEST });
      const outcome = loadTaskAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.loadEntries.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadTaskAuditLogEntries({ latest: LATEST });
      const outcome = loadTaskAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.loadEntries.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
