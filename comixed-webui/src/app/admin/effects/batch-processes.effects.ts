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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  deleteCompletedBatchJobs,
  deleteCompletedBatchJobsFailure,
  deleteCompletedBatchJobsSuccess,
  deleteSelectedBatchJobs,
  deleteSelectedBatchJobsFailure,
  deleteSelectedBatchJobsSuccess,
  loadBatchProcessList,
  loadBatchProcessListFailure,
  loadBatchProcessListSuccess
} from '../actions/batch-processes.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BatchProcessesService } from '@app/admin/services/batch-processes.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { BatchProcessDetail } from '@app/admin/models/batch-process-detail';

@Injectable()
export class BatchProcessesEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  batchProcessService = inject(BatchProcessesService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  loadBatchProcessList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBatchProcessList),
      tap(() => this.logger.debug('Loading batch process list')),
      switchMap(() =>
        this.batchProcessService.getAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((entries: BatchProcessDetail[]) =>
            loadBatchProcessListSuccess({ processes: entries })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'batch-processes.load-batch-process-list.effect-failure'
              )
            );
            return of(loadBatchProcessListFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadBatchProcessListFailure());
      })
    );
  });
  deleteCompletedJobs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteCompletedBatchJobs),
      tap(action => this.logger.trace('Deleting completed jobs:', action)),
      switchMap(action =>
        this.batchProcessService.deleteCompletedJobs().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'batch-processes.delete-completed-jobs.effect-success'
              )
            )
          ),
          map((response: BatchProcessDetail[]) =>
            deleteCompletedBatchJobsSuccess({ processes: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'batch-processes.delete-completed-jobs.effect-failure'
              )
            );
            return of(deleteCompletedBatchJobsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteCompletedBatchJobsFailure());
      })
    );
  });
  deleteSelectedJobs$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteSelectedBatchJobs),
      tap(action => this.logger.trace('Deleting selected jobs:', action)),
      switchMap(action =>
        this.batchProcessService
          .deleteSelectedJobs({ jobIds: action.jobIds })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'batch-processes.delete-selected-jobs.effect-success'
                )
              )
            ),
            map((response: BatchProcessDetail[]) =>
              deleteSelectedBatchJobsSuccess({ processes: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'batch-processes.delete-selected-jobs.effect-failure'
                )
              );
              return of(deleteSelectedBatchJobsFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteSelectedBatchJobsFailure());
      })
    );
  });
}
