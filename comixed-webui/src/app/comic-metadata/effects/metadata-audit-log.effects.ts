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
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import {
  clearMetadataAuditLog,
  clearMetadataAuditLogFailed,
  loadMetadataAuditLog,
  loadMetadataAuditLogFailed,
  metadataAuditLogCleared,
  metadataAuditLogLoaded
} from '../actions/metadata-audit-log.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MetadataService } from '@app/comic-metadata/services/metadata.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { MetadataAuditLogEntry } from '@app/comic-metadata/models/metadata-audit-log-entry';
import { of } from 'rxjs';

@Injectable()
export class MetadataAuditLogEffects {
  loadMetadataAuditLog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMetadataAuditLog),
      tap(() => this.logger.trace('Loading metadata audit log')),
      switchMap(() =>
        this.metadataService.loadAuditLog().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: MetadataAuditLogEntry[]) =>
            metadataAuditLogLoaded({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-audit-log.load-entries.effect-failure'
              )
            );
            return of(loadMetadataAuditLogFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadMetadataAuditLogFailed());
      })
    );
  });

  clearMetadataAuditLog$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearMetadataAuditLog),
      tap(() => this.logger.trace('Clearing metadata audit log')),
      switchMap(() =>
        this.metadataService.clearAuditLog().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'metadata-audit-log.clear-entries.effect-success'
              )
            )
          ),
          map(() => metadataAuditLogCleared()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-audit-log.clear-entries.effect-failure'
              )
            );
            return of(clearMetadataAuditLogFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(clearMetadataAuditLogFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private metadataService: MetadataService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
