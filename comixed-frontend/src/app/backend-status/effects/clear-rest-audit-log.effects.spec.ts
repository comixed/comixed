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

import { Observable, of, throwError } from 'rxjs';
import { ClearRestAuditLogEffects } from 'app/backend-status/effects/clear-rest-audit-log.effects';
import { RestAuditLogService } from 'app/backend-status/services/rest-audit-log.service';
import { AlertService, ApiResponse } from 'app/core';
import { TestBed } from '@angular/core/testing';
import { CoreModule } from 'app/core/core.module';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { provideMockActions } from '@ngrx/effects/testing';
import { MessageService } from 'primeng/api';
import {
  clearLoadedAuditLog,
  clearRestAuditLog,
  clearRestAuditLogFailed,
  restAuditLogClearSuccess
} from 'app/backend-status/actions/clear-rest-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ClearRestAuditLogEffects', () => {
  let actions$: Observable<any>;
  let effects: ClearRestAuditLogEffects;
  let restAuditLogService: jasmine.SpyObj<RestAuditLogService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ClearRestAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: RestAuditLogService,
          useValue: {
            clearRestAuditLog: jasmine.createSpy(
              'RestAuditLogService.clearRestAuditLog()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<ClearRestAuditLogEffects>(ClearRestAuditLogEffects);
    restAuditLogService = TestBed.get(RestAuditLogService);
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('clearing the rest audit log', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true } as ApiResponse<void>;
      const action = clearRestAuditLog();
      const outcome1 = restAuditLogClearSuccess();
      const outcome2 = clearLoadedAuditLog();

      actions$ = hot('-a', { a: action });

      restAuditLogService.clearRestAuditLog.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.clearRestAuditLog$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires on action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearRestAuditLog();
      const outcome = clearRestAuditLogFailed();

      actions$ = hot('-a', { a: action });
      restAuditLogService.clearRestAuditLog.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearRestAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires on action on general failure', () => {
      const action = clearRestAuditLog();
      const outcome = clearRestAuditLogFailed();

      actions$ = hot('-a', { a: action });
      restAuditLogService.clearRestAuditLog.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearRestAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
