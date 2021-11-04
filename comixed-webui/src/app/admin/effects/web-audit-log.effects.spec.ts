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
import { WebAuditLogEffects } from './web-audit-log.effects';
import { WebAuditLogService } from '@app/admin/services/web-audit-log.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  WEB_AUDIT_LOG_ENTRY_1,
  WEB_AUDIT_LOG_ENTRY_2,
  WEB_AUDIT_LOG_ENTRY_3
} from '@app/admin/admin.fixtures';
import {
  clearWebAuditLog,
  clearWebAuditLogFailed,
  loadWebAuditLogEntries,
  loadWebAuditLogEntriesFailed,
  webAuditLogCleared,
  webAuditLogEntriesLoaded
} from '@app/admin/actions/web-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LoadWebAuditLogEntriesResponse } from '@app/admin/models/net/load-web-audit-log-entries-response';
import { AlertService } from '@app/core/services/alert.service';

describe('WebAuditLogEffects', () => {
  const ENTRIES = [
    WEB_AUDIT_LOG_ENTRY_1,
    WEB_AUDIT_LOG_ENTRY_2,
    WEB_AUDIT_LOG_ENTRY_3
  ];
  const TIMESTAMP = new Date().getTime();

  let actions$: Observable<any>;
  let effects: WebAuditLogEffects;
  let webAuditLogService: jasmine.SpyObj<WebAuditLogService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        WebAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: WebAuditLogService,
          useValue: {
            load: jasmine.createSpy('WebAuditLogService.load()'),
            clear: jasmine.createSpy('WebauditLogService.clear()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(WebAuditLogEffects);
    webAuditLogService = TestBed.inject(
      WebAuditLogService
    ) as jasmine.SpyObj<WebAuditLogService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading log entries', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        entries: ENTRIES,
        latest: TIMESTAMP
      } as LoadWebAuditLogEntriesResponse;
      const action = loadWebAuditLogEntries({ timestamp: TIMESTAMP });
      const outcome = webAuditLogEntriesLoaded({
        entries: ENTRIES,
        latest: TIMESTAMP
      });

      actions$ = hot('-a', { a: action });
      webAuditLogService.load.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadWebAuditLogEntries({ timestamp: TIMESTAMP });
      const outcome = loadWebAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      webAuditLogService.load.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadWebAuditLogEntries({ timestamp: TIMESTAMP });
      const outcome = loadWebAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      webAuditLogService.load.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clearing the web audit log', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({
        status: 200,
        statusText: 'OK'
      });
      const action = clearWebAuditLog();
      const outcome = webAuditLogCleared();

      actions$ = hot('-a', { a: action });
      webAuditLogService.clear.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clear$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearWebAuditLog();
      const outcome = clearWebAuditLogFailed();

      actions$ = hot('-a', { a: action });
      webAuditLogService.clear.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clear$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearWebAuditLog();
      const outcome = clearWebAuditLogFailed();

      actions$ = hot('-a', { a: action });
      webAuditLogService.clear.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clear$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
