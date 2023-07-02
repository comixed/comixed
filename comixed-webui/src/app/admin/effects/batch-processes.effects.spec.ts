/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { BatchProcessesEffects } from './batch-processes.effects';
import {
  BATCH_PROCESS_STATUS_1,
  BATCH_PROCESS_STATUS_2,
  BATCH_PROCESS_STATUS_3,
  BATCH_PROCESS_STATUS_4,
  BATCH_PROCESS_STATUS_5
} from '@app/admin/admin.fixtures';
import { BatchProcessesService } from '@app/admin/services/batch-processes.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  batchProcessListLoaded,
  loadBatchProcessList,
  loadBatchProcessListFailed
} from '@app/admin/actions/batch-processes.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('BatchProcessesEffects', () => {
  const ENTRIES = [
    BATCH_PROCESS_STATUS_1,
    BATCH_PROCESS_STATUS_2,
    BATCH_PROCESS_STATUS_3,
    BATCH_PROCESS_STATUS_4,
    BATCH_PROCESS_STATUS_5
  ];

  let actions$: Observable<any>;
  let effects: BatchProcessesEffects;
  let batchProcessesService: jasmine.SpyObj<BatchProcessesService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        BatchProcessesEffects,
        provideMockActions(() => actions$),
        {
          provide: BatchProcessesService,
          useValue: {
            getAll: jasmine.createSpy('BatchProcessesService.getAll()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BatchProcessesEffects);
    batchProcessesService = TestBed.inject(
      BatchProcessesService
    ) as jasmine.SpyObj<BatchProcessesService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of batch processes', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadBatchProcessList();
      const outcome = batchProcessListLoaded({ processes: ENTRIES });

      actions$ = hot('-a', { a: action });
      batchProcessesService.getAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadBatchProcessList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBatchProcessList();
      const outcome = loadBatchProcessListFailed();

      actions$ = hot('-a', { a: action });
      batchProcessesService.getAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadBatchProcessList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBatchProcessList();
      const outcome = loadBatchProcessListFailed();

      actions$ = hot('-a', { a: action });
      batchProcessesService.getAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadBatchProcessList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
