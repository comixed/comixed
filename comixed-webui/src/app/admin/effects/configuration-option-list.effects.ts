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
import { ConfigurationService } from '@app/admin/services/configuration.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import {
  configurationOptionsLoaded,
  loadConfigurationOptions,
  loadConfigurationOptionsFailed
} from '@app/admin/actions/configuration-option-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ConfigurationOption } from '@app/admin/models/configuration-option';
import { of } from 'rxjs';

@Injectable()
export class ConfigurationOptionListEffects {
  loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadConfigurationOptions),
      tap(action =>
        this.logger.debug('Effect: load all configuration options:', action)
      ),
      switchMap(action =>
        this.configurationService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ConfigurationOption[]) =>
            configurationOptionsLoaded({ options: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'configuration.load-all.effect-failure'
              )
            );
            return of(loadConfigurationOptionsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadConfigurationOptionsFailed());
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
