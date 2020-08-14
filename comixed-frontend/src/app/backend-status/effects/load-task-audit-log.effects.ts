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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/logger';
import {
  loadTaskAuditLogEntries,
  loadTaskAuditLogFailed,
  taskAuditLogEntriesLoaded
} from 'app/backend-status/actions/load-task-audit-log.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { TaskAuditLogService } from 'app/backend-status/services/task-audit-log.service';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoadTaskAuditLogResponse } from 'app/backend-status/models/net/load-task-audit-log-response';

@Injectable()
export class LoadTaskAuditLogEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private taskAuditLogService: TaskAuditLogService,
    private alertService: AlertService,
    private translatesService: TranslateService
  ) {}

  loadTaskAuditLogEntries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadTaskAuditLogEntries),
      tap(action =>
        this.logger.debug('effect: load task audit log entries:', action)
      ),
      switchMap(action =>
        this.taskAuditLogService.getLogEntries(action.since).pipe(
          tap(response => this.logger.debug('received response:', response)),
          tap(
            (response: ApiResponse<LoadTaskAuditLogResponse>) =>
              !response.success &&
              this.alertService.error(
                this.translatesService.instant(
                  'task.list.effects.load.error.detail'
                )
              )
          ),
          map((response: ApiResponse<LoadTaskAuditLogResponse>) =>
            response.success
              ? taskAuditLogEntriesLoaded({
                  entries: response.result.entries,
                  latest: response.result.latest
                })
              : loadTaskAuditLogFailed()
          ),
          catchError(error => {
            this.logger.error(
              'service failure getting task audit log entries:',
              error
            );
            this.alertService.error(
              this.translatesService.instant(
                'task.list.effects.load.error.detail'
              )
            );
            return of(loadTaskAuditLogFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error(
          'service failure getting task audit log entries:',
          error
        );
        this.alertService.error(
          this.translatesService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(loadTaskAuditLogFailed());
      })
    );
  });
}
