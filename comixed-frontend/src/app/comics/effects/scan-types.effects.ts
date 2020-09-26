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
  getScanTypes,
  getScanTypesFailed,
  scanTypesReceived
} from 'app/comics/actions/scan-types.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';
import { ScanTypeService } from 'app/comics/services/scan-type.service';
import { ApiResponse } from 'app/core';
import { ScanType } from 'app/comics';
import { of } from 'rxjs';

@Injectable()
export class ScanTypesEffects {
  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private scanTypeService: ScanTypeService
  ) {}

  getAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getScanTypes),
      tap(action => this.logger.trace('Effect: get scan types:', action)),
      switchMap(action =>
        this.scanTypeService.getAll().pipe(
          tap(response => this.logger.trace('Received response:', response)),
          map((response: ApiResponse<ScanType[]>) =>
            response.success
              ? scanTypesReceived({ types: response.result })
              : getScanTypesFailed()
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            return of(getScanTypesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        return of(getScanTypesFailed());
      })
    );
  });
}
