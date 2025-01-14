/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  getFeatureEnabled,
  getFeatureEnabledFailure,
  getFeatureEnabledSuccess
} from '../actions/feature-enabled.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ConfigurationService } from '@app/admin/services/configuration.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { FeatureEnabledResponse } from '@app/admin/models/net/feature-enabled-response';
import { of } from 'rxjs';

@Injectable()
export class FeatureEnabledEffects {
  getFeatureEnabled$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getFeatureEnabled),
      tap(action =>
        this.logger.debug('Getting feature enabled state:', action)
      ),
      switchMap(action =>
        this.configurationService.getFeatureEnabled({ name: action.name }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: FeatureEnabledResponse) =>
            getFeatureEnabledSuccess({
              name: action.name,
              enabled: response.enabled
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('feature-enabled.effect-failure', {
                name: action.name
              })
            );
            return of(getFeatureEnabledFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(getFeatureEnabledFailure());
      })
    );
  });

  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private configurationService: ConfigurationService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
