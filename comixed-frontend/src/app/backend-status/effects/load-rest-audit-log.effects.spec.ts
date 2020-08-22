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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

import { LoadRestAuditLogEffects } from './load-rest-audit-log.effects';
import { RestAuditLogService } from 'app/backend-status/services/rest-audit-log.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from 'app/core/core.module';
import { AlertService, ApiResponse } from 'app/core';
import { REST_AUDIT_LOG_ENTRY_1 } from 'app/backend-status/backend-status.fixtures';
import { GetRestAuditLogEntriesResponse } from 'app/backend-status/models/net/get-rest-audit-log-entries-response';
import {
  getRestAuditLogEntries,
  getRestAuditLogEntriesFailed,
  restAuditLogEntriesReceived
} from 'app/backend-status/actions/load-rest-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

describe('LoadRestAuditLogEffects', () => {
  const ENTRIES = [REST_AUDIT_LOG_ENTRY_1];
  const LATEST = new Date().getTime();

  let actions$: Observable<any>;
  let effects: LoadRestAuditLogEffects;
  let restAuditLogService: jasmine.SpyObj<RestAuditLogService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        LoadRestAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: RestAuditLogService,
          useValue: {
            loadEntries: jasmine.createSpy('RestAuditLogService.loadEntries()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<LoadRestAuditLogEffects>(LoadRestAuditLogEffects);
    restAuditLogService = TestBed.get(RestAuditLogService) as jasmine.SpyObj<
      RestAuditLogService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting audit log entries', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true,
        result: { entries: ENTRIES, latest: LATEST }
      } as ApiResponse<GetRestAuditLogEntriesResponse>;
      const action = getRestAuditLogEntries({ cutoff: 0 });
      const outcome = restAuditLogEntriesReceived({
        entries: ENTRIES,
        latest: LATEST
      });

      actions$ = hot('-a', { a: action });
      restAuditLogService.loadEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getLogEntries$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<
        GetRestAuditLogEntriesResponse
      >;
      const action = getRestAuditLogEntries({ cutoff: 0 });
      const outcome = getRestAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      restAuditLogService.loadEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getLogEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = getRestAuditLogEntries({ cutoff: 0 });
      const outcome = getRestAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      restAuditLogService.loadEntries.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getLogEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = getRestAuditLogEntries({ cutoff: 0 });
      const outcome = getRestAuditLogEntriesFailed();

      actions$ = hot('-a', { a: action });
      restAuditLogService.loadEntries.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getLogEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
