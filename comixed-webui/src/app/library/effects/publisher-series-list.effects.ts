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
import { PublisherSeriesListActions } from '../actions/publisher-series-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/services/alert-service';
import { CollectionService } from '@app/library/services/collection-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class PublisherSeriesListEffects {
  readonly logger = inject(LoggerService);
  readonly collectionService = inject(CollectionService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);
  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PublisherSeriesListActions.load),
      tap(action => this.logger.debug('Loading publisher detail:', action)),
      switchMap(action =>
        this.collectionService
          .loadPublisherSeriesList({
            name: action.name,
            index: action.index,
            size: action.size,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              PublisherSeriesListActions.loadSuccess({
                entries: response.entries,
                total: response.totalSeries
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'publisher-series-list-effects.load.service-failure',
                  { publisherName: action.name }
                )
              );
              return of(PublisherSeriesListActions.loadFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(PublisherSeriesListActions.loadFailure());
      })
    );
  });
}
