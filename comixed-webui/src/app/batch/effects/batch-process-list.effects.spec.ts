/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { BatchProcessListEffects } from '@app/batch/effects/batch-process-list.effects';
import { expect, it, vi } from 'vitest';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import BatchProcessService from '@app/batch/services/batch-process-service';
import { BATCH_PROCESS_1, BATCH_PROCESS_2 } from '@app/batch/batch-fixtures';
import { BatchProcessListActions } from '@app/batch/actions/batch-process-list.actions';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';

describe('BatchProcessListEffects', () => {
  const TEST_BATCH_PROCESS_LIST = [BATCH_PROCESS_1, BATCH_PROCESS_2];
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let actions$: Observable<unknown>;
  let effects: BatchProcessListEffects;
  let batchProcessService: BatchProcessService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BatchProcessListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        BatchProcessService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(BatchProcessListEffects);
    batchProcessService = TestBed.inject(BatchProcessService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading batch processes', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_BATCH_PROCESS_LIST;
      const action = BatchProcessListActions.load();
      const outcome = BatchProcessListActions.loadSuccess({
        entries: TEST_BATCH_PROCESS_LIST
      });

      const loadSpy = vi
        .spyOn(batchProcessService, 'loadBatchProcessList')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.loadBatchProcessList$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = BatchProcessListActions.load();
      const outcome = BatchProcessListActions.loadFailure();

      const loadSpy = vi
        .spyOn(batchProcessService, 'loadBatchProcessList')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.loadBatchProcessList$)
      ).resolves.toEqual(outcome);

      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = BatchProcessListActions.load();
      const outcome = BatchProcessListActions.loadFailure();

      const loadSpy = vi
        .spyOn(batchProcessService, 'loadBatchProcessList')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.loadBatchProcessList$)
      ).resolves.toEqual(outcome);

      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('deleting completed batch processes', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_BATCH_PROCESS_LIST;
      const action = BatchProcessListActions.deleteCompleted();
      const outcome = BatchProcessListActions.deleteCompletedSuccess({
        entries: TEST_BATCH_PROCESS_LIST
      });

      const deleteSpy = vi
        .spyOn(batchProcessService, 'deleteCompletedBatchProcesses')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.deleteCompletedProcesses$)
      ).resolves.toEqual(outcome);
      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = BatchProcessListActions.deleteCompleted();
      const outcome = BatchProcessListActions.deleteCompletedFailure();

      const deleteSpy = vi
        .spyOn(batchProcessService, 'deleteCompletedBatchProcesses')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.deleteCompletedProcesses$)
      ).resolves.toEqual(outcome);

      expect(deleteSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = BatchProcessListActions.deleteCompleted();
      const outcome = BatchProcessListActions.deleteCompletedFailure();

      const deleteSpy = vi
        .spyOn(batchProcessService, 'deleteCompletedBatchProcesses')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.deleteCompletedProcesses$)
      ).resolves.toEqual(outcome);

      expect(deleteSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
