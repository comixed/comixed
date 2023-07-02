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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  batchProcessListLoaded,
  loadBatchProcessList,
  loadBatchProcessListFailed
} from '../actions/batch-processes.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { BatchProcessesService } from '@app/admin/services/batch-processes.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BatchProcess } from '@app/admin/models/batch-process';
import { of } from 'rxjs';

@Injectable()
export class BatchProcessesEffects {
  loadBatchProcessList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBatchProcessList),
      tap(() => this.logger.debug('Loading batch process list')),
      switchMap(() =>
        this.batchProcessService.getAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((entries: BatchProcess[]) =>
            batchProcessListLoaded({ processes: entries })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'batch-processes.load-batch-process-list.effect-failure'
              )
            );
            return of(loadBatchProcessListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('ap.general-effect-failure')
        );
        return of(loadBatchProcessListFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private batchProcessService: BatchProcessesService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
