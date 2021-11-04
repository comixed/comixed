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
  configurationOptionsSaved,
  saveConfigurationOptions,
  saveConfigurationOptionsFailed
} from '../actions/save-configuration-options.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ConfigurationService } from '@app/admin/services/configuration.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { SaveConfigurationOptionsResponse } from '@app/admin/models/net/save-configuration-options-response';
import { configurationOptionsLoaded } from '@app/admin/actions/configuration-option-list.actions';
import { of } from 'rxjs';

@Injectable()
export class SaveConfigurationOptionsEffects {
  saveOptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveConfigurationOptions),
      tap(action =>
        this.logger.debug('Effect: save configuration options:', action)
      ),
      switchMap(action =>
        this.configurationService.saveOptions({ options: action.options }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant('save-configuration.effect-success')
            )
          ),
          mergeMap((response: SaveConfigurationOptionsResponse) => [
            configurationOptionsSaved(),
            configurationOptionsLoaded({ options: response.options })
          ]),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('save-configuration.effect-failure')
            );
            return of(saveConfigurationOptionsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveConfigurationOptionsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private configurationService: ConfigurationService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
