/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  fetchIssuesForSeries,
  fetchIssuesForSeriesFailed,
  issuesForSeriesFetched
} from '../actions/fetch-issues-for-series.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class FetchIssuesForSeriesEffects {
  fetchIssuesForSeries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchIssuesForSeries),
      tap(action => this.logger.debug('Fetching issues for series:', action)),
      switchMap(action =>
        this.metadataService
          .fetchIssuesForSeries({
            source: action.source,
            volume: action.volume
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'metadata.fetch-issues.effect-success',
                  {
                    series: action.volume.name,
                    volume: action.volume.startYear
                  }
                )
              )
            ),
            map(() => issuesForSeriesFetched()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'metadata.fetch-issues.effect-failure',
                  {
                    series: action.volume.name,
                    volume: action.volume.startYear
                  }
                )
              );
              return of(fetchIssuesForSeriesFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(fetchIssuesForSeriesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private metadataService: ComicBookScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
