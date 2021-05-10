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
import { ScanTypeEffects } from './scan-type.effects';
import { ScanTypeService } from '@app/comic/services/scan-type.service';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3
} from '@app/comic/comic.fixtures';
import {
  loadScanTypes,
  loadScanTypesFailed,
  scanTypesLoaded
} from '@app/comic/actions/scan-type.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '@app/core/services/alert.service';

describe('ScanTypeEffects', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_2, SCAN_TYPE_3];

  let actions$: Observable<any> = null;
  let effects: ScanTypeEffects;
  let scanTypeService: jasmine.SpyObj<ScanTypeService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ScanTypeEffects,
        provideMockActions(() => actions$),
        {
          provide: ScanTypeService,
          useValue: {
            loadScanTypes: jasmine.createSpy('ScanTypeService.loadScanTypes()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ScanTypeEffects);
    scanTypeService = TestBed.inject(
      ScanTypeService
    ) as jasmine.SpyObj<ScanTypeService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading scan types', () => {
    it('fires an action on success', () => {
      const serviceResponse = SCAN_TYPES;
      const action = loadScanTypes();
      const outcome = scanTypesLoaded({ scanTypes: SCAN_TYPES });

      actions$ = hot('-a', { a: action });
      scanTypeService.loadScanTypes.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScanTypes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadScanTypes();
      const outcome = loadScanTypesFailed();

      actions$ = hot('-a', { a: action });
      scanTypeService.loadScanTypes.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadScanTypes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadScanTypes();
      const outcome = loadScanTypesFailed();

      actions$ = hot('-a', { a: action });
      scanTypeService.loadScanTypes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadScanTypes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
