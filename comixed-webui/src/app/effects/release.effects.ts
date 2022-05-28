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
import { ReleaseService } from '@app/services/release.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  currentReleaseDetailsLoaded,
  latestReleaseDetailsLoaded,
  loadCurrentReleaseDetails,
  loadCurrentReleaseDetailsFailed,
  loadLatestReleaseDetails,
  loadLatestReleaseDetailsFailed
} from '@app/actions/release.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CurrentRelease } from '@app/models/current-release';
import { of } from 'rxjs';
import { LatestRelease } from '@app/models/latest-release';

@Injectable()
export class ReleaseEffects {
  loadCurrentRelease$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCurrentReleaseDetails),
      tap(action =>
        this.logger.debug('Effect: load current release details:', action)
      ),
      switchMap(() =>
        this.buildDetailsService.loadCurrentReleaseDetails().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: CurrentRelease) =>
            currentReleaseDetailsLoaded({ details: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'build-details.load-current-effect-failure'
              )
            );
            return of(loadCurrentReleaseDetailsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadCurrentReleaseDetailsFailed());
      })
    );
  });

  loadLatestRelease$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadLatestReleaseDetails),
      tap(action =>
        this.logger.debug('Effect: load latest release details:', action)
      ),
      switchMap(() =>
        this.buildDetailsService.loadLatestReleaseDetails().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LatestRelease) =>
            latestReleaseDetailsLoaded({ details: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'build-details.load-latest-effect-failure'
              )
            );
            return of(loadLatestReleaseDetailsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadLatestReleaseDetailsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private buildDetailsService: ReleaseService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
