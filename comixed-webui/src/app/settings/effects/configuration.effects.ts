/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ConfigurationActions } from '../actions/configuration.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ConfigurationService } from '@app/settings/services/configuration-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class ConfigurationEffects {
  readonly logger = inject(LoggerService);
  readonly configurationService = inject(ConfigurationService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ConfigurationActions.load),
      tap(() => this.logger.debug('Loading configuration options')),
      switchMap(() =>
        this.configurationService.load().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            ConfigurationActions.loadSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'configuration-effects.load.service-failure'
              )
            );
            return of(ConfigurationActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ConfigurationActions.loadFailure());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ConfigurationActions.save),
      tap(action => this.logger.debug('Saving configuration options:', action)),
      switchMap(action =>
        this.configurationService
          .save({
            options: action.entries
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              ConfigurationActions.saveSuccess({ entries: response.options })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'configuration-effects.save.service-failure'
                )
              );
              return of(ConfigurationActions.saveFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ConfigurationActions.saveFailure());
      })
    );
  });
}
