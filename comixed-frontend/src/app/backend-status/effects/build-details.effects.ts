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
import { LoggerService } from '@angular-ru/logger';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { BuildDetailsService } from 'app/backend-status/services/build-details.service';
import {
  buildDetailsReceived,
  fetchBuildDetails,
  fetchBuildDetailsFailed
} from 'app/backend-status/actions/build-details.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BuildDetails } from 'app/backend-status/models/build-details';
import { of } from 'rxjs';

@Injectable()
export class BuildDetailsEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private buildDetailsService: BuildDetailsService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  getBuildDetails$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchBuildDetails),
      tap(action =>
        this.logger.debug('effect: fetching build details:', action)
      ),
      switchMap(action =>
        this.buildDetailsService.getBuildDetails().pipe(
          tap(response => this.logger.debug('response received:', response)),
          tap(
            (response: ApiResponse<BuildDetails>) =>
              !response.success &&
              this.alertService.error(
                this.translateService.instant(
                  'build-details.effects.get-build-details.error.detail'
                )
              )
          ),
          map((response: ApiResponse<BuildDetails>) =>
            response.success
              ? buildDetailsReceived({ buildDetails: response.result })
              : fetchBuildDetailsFailed()
          ),
          catchError(error => {
            this.logger.error('service failure fetching build details:', error);
            this.alertService.error(
              this.translateService.instant(
                'build-details.effects.get-build-details.error.detail'
              )
            );
            return of(fetchBuildDetailsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('service failure fetching build details:', error);
        this.alertService.error(
          this.translateService.instant(
            'build-details.effects.get-build-details.error.detail'
          )
        );
        return of(fetchBuildDetailsFailed());
      })
    );
  });
}
