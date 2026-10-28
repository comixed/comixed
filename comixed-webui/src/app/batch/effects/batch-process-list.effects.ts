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

import { inject, Injectable } from '@angular/core';
import BatchProcessService from '@app/batch/services/batch-process-service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { BatchProcessListActions } from '@app/batch/actions/batch-process-list.actions';

@Injectable()
export class BatchProcessListEffects {
  readonly logger = inject(LoggerService);
  readonly batchProcessService = inject(BatchProcessService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);
  loadBatchProcessList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BatchProcessListActions.load),
      tap(() => this.logger.debug('Loading batch process list')),
      switchMap(() =>
        this.batchProcessService.loadBatchProcessList().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            BatchProcessListActions.loadSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'batch-process-list-effects.load-batch-process-list.service-failure'
              )
            );
            return of(BatchProcessListActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(BatchProcessListActions.loadFailure());
      })
    );
  });
  deleteCompletedProcesses$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BatchProcessListActions.deleteCompleted),
      tap(() => this.logger.debug('Deleting completed batch processes')),
      switchMap(() =>
        this.batchProcessService.deleteCompletedBatchProcesses().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            BatchProcessListActions.deleteCompletedSuccess({
              entries: response
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'batch-process-list-effects.delete-completed-batch-processes.service-failure'
              )
            );
            return of(BatchProcessListActions.deleteCompletedFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(BatchProcessListActions.deleteCompletedFailure());
      })
    );
  });
}
