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
import { Observable, of, throwError } from 'rxjs';

import { ClearTaskAuditLogEffects } from './clear-task-audit-log.effects';
import { TaskAuditLogService } from 'app/backend-status/services/task-audit-log.service';
import { AlertService, ApiResponse } from 'app/core';
import { CoreModule } from 'app/core/core.module';
import {
  clearTaskAuditLog,
  cleartaskAuditLogFailed,
  taskAuditLogCleared
} from 'app/backend-status/actions/clear-task-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

describe('ClearTaskAuditLogEffects', () => {
  let actions$: Observable<any>;
  let effects: ClearTaskAuditLogEffects;
  let taskAuditLogService: jasmine.SpyObj<TaskAuditLogService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ClearTaskAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: TaskAuditLogService,
          useValue: {
            clearAuditLog: jasmine.createSpy(
              'TaskAuditLogService.clearAuditLog()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<ClearTaskAuditLogEffects>(ClearTaskAuditLogEffects);
    taskAuditLogService = TestBed.get(TaskAuditLogService);
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('clearing the audit log', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true } as ApiResponse<void>;
      const action = clearTaskAuditLog();
      const outcome = taskAuditLogCleared();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.clearAuditLog.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearTaskAuditLog$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<void>;
      const action = clearTaskAuditLog();
      const outcome = cleartaskAuditLogFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.clearAuditLog.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearTaskAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearTaskAuditLog();
      const outcome = cleartaskAuditLogFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.clearAuditLog.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearTaskAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearTaskAuditLog();
      const outcome = cleartaskAuditLogFailed();

      actions$ = hot('-a', { a: action });
      taskAuditLogService.clearAuditLog.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearTaskAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
