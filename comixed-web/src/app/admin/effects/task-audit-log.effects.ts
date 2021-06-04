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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/logger';
import { TaskAuditLogService } from '@app/admin/services/task-audit-log.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogEntriesFailed,
  taskAuditLogEntriesLoaded
} from '@app/admin/actions/task-audit-log.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoadTaskAuditLogEntriesResponse } from '@app/admin/models/net/load-task-audit-log-entries-response';
import { of } from 'rxjs';

@Injectable()
export class TaskAuditLogEffects {
  loadEntries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadTaskAuditLogEntries),
      tap(action =>
        this.logger.debug('Effect: load task audit log entries:', action)
      ),
      switchMap(action =>
        this.taskAuditLogService.loadEntries({ latest: action.latest }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LoadTaskAuditLogEntriesResponse) =>
            taskAuditLogEntriesLoaded({
              entries: response.entries,
              latest: response.latest,
              lastPage: response.lastPage
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'task-audit-log.load-entries-effect-failure'
              )
            );
            return of(loadTaskAuditLogEntriesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadTaskAuditLogEntriesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private taskAuditLogService: TaskAuditLogService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
