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

import { MetadataAuditLogEffects } from './metadata-audit-log.effects';
import { MetadataService } from '@app/comic-metadata/services/metadata.service';
import { METADATA_AUDIT_LOG_ENTRY_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  clearMetadataAuditLog,
  clearMetadataAuditLogFailed,
  loadMetadataAuditLog,
  loadMetadataAuditLogFailed,
  metadataAuditLogCleared,
  metadataAuditLogLoaded
} from '@app/comic-metadata/actions/metadata-audit-log.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('MetadataAuditLogEffects', () => {
  const ENTRIES = [METADATA_AUDIT_LOG_ENTRY_1];

  let actions$: Observable<any>;
  let effects: MetadataAuditLogEffects;
  let metadataService: jasmine.SpyObj<MetadataService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        MetadataAuditLogEffects,
        provideMockActions(() => actions$),
        {
          provide: MetadataService,
          useValue: {
            loadAuditLog: jasmine.createSpy('MetadataService.loadAuditLog()'),
            clearAuditLog: jasmine.createSpy('MetadataService.clearAuditLog()')
          }
        }
      ]
    });

    effects = TestBed.inject(MetadataAuditLogEffects);
    metadataService = TestBed.inject(
      MetadataService
    ) as jasmine.SpyObj<MetadataService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading audit log entries', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadMetadataAuditLog();
      const outcome = metadataAuditLogLoaded({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      metadataService.loadAuditLog.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetadataAuditLog$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadMetadataAuditLog();
      const outcome = loadMetadataAuditLogFailed();

      actions$ = hot('-a', { a: action });
      metadataService.loadAuditLog.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadMetadataAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadMetadataAuditLog();
      const outcome = loadMetadataAuditLogFailed();

      actions$ = hot('-a', { a: action });
      metadataService.loadAuditLog.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadMetadataAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clearing audit log entries', () => {
    it('fires an action on success', () => {
      const serverResponse = new HttpResponse({ status: 200 });
      const action = clearMetadataAuditLog();
      const outcome = metadataAuditLogCleared();

      actions$ = hot('-a', { a: action });
      metadataService.clearAuditLog.and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearMetadataAuditLog$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serverResponse = new HttpErrorResponse({});
      const action = clearMetadataAuditLog();
      const outcome = clearMetadataAuditLogFailed();

      actions$ = hot('-a', { a: action });
      metadataService.clearAuditLog.and.returnValue(throwError(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearMetadataAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearMetadataAuditLog();
      const outcome = clearMetadataAuditLogFailed();

      actions$ = hot('-a', { a: action });
      metadataService.clearAuditLog.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearMetadataAuditLog$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
