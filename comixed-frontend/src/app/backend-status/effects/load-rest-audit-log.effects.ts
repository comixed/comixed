/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { RestAuditLogService } from 'app/backend-status/services/rest-audit-log.service';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import {
  getRestAuditLogEntries,
  getRestAuditLogEntriesFailed,
  restAuditLogEntriesReceived
} from 'app/backend-status/actions/load-rest-audit-log.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { GetRestAuditLogEntriesResponse } from 'app/backend-status/models/net/get-rest-audit-log-entries-response';
import { of } from 'rxjs';

@Injectable()
export class LoadRestAuditLogEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private restAuditLogService: RestAuditLogService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  getLogEntries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getRestAuditLogEntries),
      tap(action =>
        this.logger.debug('effect: get rest audit log entries:', action)
      ),
      switchMap(action =>
        this.restAuditLogService.loadEntries(action.cutoff).pipe(
          tap(response => this.logger.debug('received response:', response)),
          tap(
            (response: ApiResponse<GetRestAuditLogEntriesResponse>) =>
              !response.success &&
              this.alertService.error(
                this.translateService.instant(
                  'backend-status.effects.get-rest-audit-log-entries.error-detail'
                )
              )
          ),
          map((response: ApiResponse<GetRestAuditLogEntriesResponse>) =>
            response.success
              ? restAuditLogEntriesReceived({
                  entries: response.result.entries,
                  latest: response.result.latest
                })
              : getRestAuditLogEntriesFailed()
          ),
          catchError(error => {
            this.logger.error('service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'backend-status.effects.get-rest-audit-log-entries.error-detail'
              )
            );
            return of(getRestAuditLogEntriesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('service failure:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(getRestAuditLogEntriesFailed());
      })
    );
  });
}
