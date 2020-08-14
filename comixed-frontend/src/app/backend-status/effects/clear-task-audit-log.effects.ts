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
import {
  clearTaskAuditLog,
  cleartaskAuditLogFailed,
  taskAuditLogCleared
} from 'app/backend-status/actions/clear-task-audit-log.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';
import { TaskAuditLogService } from 'app/backend-status/services/task-audit-log.service';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class ClearTaskAuditLogEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private taskAuditLogService: TaskAuditLogService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  clearTaskAuditLog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearTaskAuditLog),
      tap(() => this.logger.debug('effect: clear audit log')),
      switchMap(() =>
        this.taskAuditLogService.clearAuditLog().pipe(
          tap(response => this.logger.debug('received response:', response)),
          tap((response: ApiResponse<void>) =>
            response.success
              ? this.alertService.info(
                  this.translateService.instant(
                    'tasks.audit-log.effects.clear-audit-log.success.detail'
                  )
                )
              : this.alertService.error(
                  this.translateService.instant(
                    'tasks.audit-log.effects.clear-audit-log.success.detail'
                  )
                )
          ),
          map((response: ApiResponse<void>) =>
            response.success ? taskAuditLogCleared() : cleartaskAuditLogFailed()
          ),
          catchError(error => {
            this.logger.error(
              'service failure clearing the task audit log:',
              error
            );
            this.alertService.error(
              this.translateService.instant(
                'tasks.audit-log.effects.clear-audit-log.success.detail'
              )
            );
            return of(cleartaskAuditLogFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error(
          'service failure clearing the task audit log:',
          error
        );
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(cleartaskAuditLogFailed());
      })
    );
  });
}
