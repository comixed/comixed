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
import { ScanTypeService } from '@app/comic/services/scan-type.service';
import { TranslateService } from '@ngx-translate/core';
import {
  loadScanTypes,
  loadScanTypesFailed,
  scanTypesLoaded
} from '@app/comic/actions/scan-type.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { ScanType } from '@app/comic/models/scan-type';
import { AlertService } from '@app/core/services/alert.service';

@Injectable()
export class ScanTypeEffects {
  loadScanTypes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadScanTypes),
      tap(action => this.logger.debug('Effect: load scan types:', action)),
      switchMap(action =>
        this.scanTypeService.loadScanTypes().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ScanType[]) =>
            scanTypesLoaded({ scanTypes: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'scan-type.load-scan-types.effect-failure'
              )
            );
            return of(loadScanTypesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadScanTypesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private scanTypeService: ScanTypeService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
