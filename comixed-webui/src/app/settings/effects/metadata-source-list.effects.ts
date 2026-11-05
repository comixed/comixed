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
import { MetadataSourceListActions } from '../actions/metadata-source-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MetadataSourceService } from '@app/settings/services/metadata-source-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class MetadataSourceListEffects {
  readonly logger = inject(LoggerService);
  readonly metadataSourceService = inject(MetadataSourceService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MetadataSourceListActions.load),
      tap(() => this.logger.debug('Load the metadata source list')),
      switchMap(() =>
        this.metadataSourceService.load().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            MetadataSourceListActions.loadSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-source-list-effects.load.service-failure'
              )
            );
            return of(MetadataSourceListActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(MetadataSourceListActions.loadFailure());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MetadataSourceListActions.save),
      tap(action => this.logger.debug('Saving metadata source:', action)),
      switchMap(action =>
        this.metadataSourceService.save({ source: action.source }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            MetadataSourceListActions.saveSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-source-list-effects.save.service-failure'
              )
            );
            return of(MetadataSourceListActions.saveFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(MetadataSourceListActions.saveFailure());
      })
    );
  });
}
