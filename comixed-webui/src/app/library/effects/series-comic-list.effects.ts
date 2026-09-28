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
import { SeriesComicListActions } from '../actions/series-comic-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/library/services/collection-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class SeriesComicListEffects {
  readonly logger = inject(LoggerService);
  readonly collectionService = inject(CollectionService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  loadSeriesComicLists$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SeriesComicListActions.load),
      tap(action => this.logger.debug('Loading series comic list:', action)),
      switchMap(action =>
        this.collectionService
          .loadSeriesComicList({
            publisherName: action.publisherName,
            seriesName: action.seriesName,
            volume: action.volume
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              SeriesComicListActions.loadSuccess({ entries: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'series-comic-list-effects.load.service-failure',
                  { seriesName: action.seriesName }
                )
              );
              return of(SeriesComicListActions.loadFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(SeriesComicListActions.loadFailure());
      })
    );
  });
}
