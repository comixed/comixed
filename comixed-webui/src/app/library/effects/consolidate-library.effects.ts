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

import {
  libraryConsolidationStarted,
  startLibraryConsolidation,
  startLibraryConsolidationFailed
} from '../actions/consolidate-library.actions';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { LibraryService } from '@app/library/services/library.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LIBRARY_CONSOLIDATION_CONFIG_URL } from '@app/library/library.constants';

@Injectable()
export class ConsolidateLibraryEffects {
  consolidateLibrary$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(startLibraryConsolidation),
      tap(action =>
        this.logger.trace('Effect: start library consolidation:', action)
      ),
      switchMap(action =>
        this.libraryService.startLibraryConsolidation().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(() =>
            this.alertService.info(
              this.translateService.instant(
                'library.consolidate.effect-success'
              )
            )
          ),
          map(() => libraryConsolidationStarted()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library.consolidate.effect-failure'
              ),
              LIBRARY_CONSOLIDATION_CONFIG_URL
            );
            return of(startLibraryConsolidationFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(startLibraryConsolidationFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private libraryService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
