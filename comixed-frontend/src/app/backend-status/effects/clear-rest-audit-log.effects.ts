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
import { LoggerService } from '@angular-ru/logger';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RestAuditLogService } from 'app/backend-status/services/rest-audit-log.service';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import {
  clearLoadedAuditLog,
  clearRestAuditLog,
  clearRestAuditLogFailed,
  restAuditLogClearSuccess
} from 'app/backend-status/actions/clear-rest-audit-log.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  getRestAuditLogEntries,
  startLoadingRestAuditLogEntries
} from 'app/backend-status/actions/load-rest-audit-log.actions';

@Injectable()
export class ClearRestAuditLogEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private restAuditLogService: RestAuditLogService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  clearRestAuditLog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearRestAuditLog),
      tap(() => this.logger.debug('effect: clear rest audit log')),
      switchMap(() =>
        this.restAuditLogService.clearRestAuditLog().pipe(
          tap(response => this.logger.debug('received response:', response)),
          tap(() =>
              this.alertService.info(
                  this.translateService.instant(
                    'rest.clear-audit-log.effects.clear-audit-log.success.detail'
                  )
                )
          ),
          mergeMap(() =>
            [restAuditLogClearSuccess(), clearLoadedAuditLog()]
          ),
          catchError(error => {
            this.logger.error(
              'service failure clearing the rest audit log:',
              error
            );
            this.alertService.error(
              this.translateService.instant(
                'rest.clear-audit-log.effects.clear-audit.log.error.detail'
              )
            );
            return of(clearRestAuditLogFailed());
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
        return of(clearRestAuditLogFailed());
      })
    );
  });
}
