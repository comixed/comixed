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
import { LoggerService } from '@angular-ru/cdk/logger';
import { BuildDetailsService } from '@app/services/build-details.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  buildDetailsLoaded,
  loadBuildDetails,
  loadBuildDetailsFailed
} from '@app/actions/build-details.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BuildDetails } from '@app/models/build-details';
import { of } from 'rxjs';

@Injectable()
export class BuildDetailsEffects {
  loadDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBuildDetails),
      tap(action => this.logger.debug('Effect: load build details:', action)),
      switchMap(action =>
        this.buildDetailsService.loadDetails().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: BuildDetails) =>
            buildDetailsLoaded({ details: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('build-details.load-effect-failure')
            );
            return of(loadBuildDetailsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadBuildDetailsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private buildDetailsService: BuildDetailsService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
