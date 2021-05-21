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

import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  clearWebAuditLog,
  clearWebAuditLogFailed,
  loadWebAuditLogEntries,
  loadWebAuditLogEntriesFailed,
  webAuditLogCleared,
  webAuditLogEntriesLoaded
} from '../actions/web-audit-log.actions';
import { LoggerService } from '@angular-ru/logger';
import { WebAuditLogService } from '@app/admin/services/web-audit-log.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadWebAuditLogEntriesResponse } from '@app/admin/models/net/load-web-audit-log-entries-response';

@Injectable()
export class WebAuditLogEffects {
  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadWebAuditLogEntries),
      tap(action =>
        this.logger.debug('Effect: load web audit log entries:', action)
      ),
      switchMap(action =>
        this.webAuditLogService.load({ timestamp: action.timestamp }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LoadWebAuditLogEntriesResponse) =>
            webAuditLogEntriesLoaded({
              entries: response.entries,
              latest: response.latest
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'web-audit-log.load-entries.effect-failure'
              )
            );
            return of(loadWebAuditLogEntriesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadWebAuditLogEntriesFailed());
      })
    );
  });

  clear$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearWebAuditLog),
      tap(action => this.logger.debug('Effect: clear web audit log:', action)),
      switchMap(action =>
        this.webAuditLogService.clear().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'web-audit-log.clear.effect-success'
              )
            )
          ),
          map(() => webAuditLogCleared()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'web-audit-log.clear.effect-failure'
              )
            );
            return of(clearWebAuditLogFailed());
          })
        )
      ),
      map(() => webAuditLogCleared()),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(clearWebAuditLogFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private webAuditLogService: WebAuditLogService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
