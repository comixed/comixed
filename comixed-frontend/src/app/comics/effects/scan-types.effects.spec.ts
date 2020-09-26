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

import { ScanTypesEffects } from './scan-types.effects';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from 'app/comics/comics.fixtures';
import { ScanTypeService } from 'app/comics/services/scan-type.service';
import { ScanType } from 'app/comics';
import { ApiResponse } from 'app/core';
import {
  getScanTypes,
  getScanTypesFailed,
  scanTypesReceived
} from 'app/comics/actions/scan-types.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { HttpErrorResponse } from '@angular/common/http';

describe('ScanTypesEffects', () => {
  const SCAN_TYPES = [
    SCAN_TYPE_1,
    SCAN_TYPE_2,
    SCAN_TYPE_3,
    SCAN_TYPE_4,
    SCAN_TYPE_5
  ];

  let actions$: Observable<any>;
  let effects: ScanTypesEffects;
  let scanTypeService: jasmine.SpyObj<ScanTypeService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        ScanTypesEffects,
        provideMockActions(() => actions$),
        {
          provide: ScanTypeService,
          useValue: {
            getAll: jasmine.createSpy('ScanTypeService.getAll()')
          }
        }
      ]
    });

    effects = TestBed.get<ScanTypesEffects>(ScanTypesEffects);
    scanTypeService = TestBed.get<ScanTypeService>(ScanTypeService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting the list of scan types', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true,
        result: SCAN_TYPES
      } as ApiResponse<ScanType[]>;
      const action = getScanTypes();
      const outcome = scanTypesReceived({ types: SCAN_TYPES });

      actions$ = hot('-a', { a: action });
      scanTypeService.getAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<ScanType[]>;
      const action = getScanTypes();
      const outcome = getScanTypesFailed();

      actions$ = hot('-a', { a: action });
      scanTypeService.getAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = getScanTypes();
      const outcome = getScanTypesFailed();

      actions$ = hot('-a', { a: action });
      scanTypeService.getAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = getScanTypes();
      const outcome = getScanTypesFailed();

      actions$ = hot('-a', { a: action });
      scanTypeService.getAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
    });
  });
});
