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
  scrapeSeriesMetadata,
  scrapeSeriesMetadataFailure,
  scrapeSeriesMetadataSuccess
} from '../actions/series-scraping.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ScrapeSeriesResponse } from '@app/comic-metadata/models/net/scrape-series-response';
import { Router } from '@angular/router';

@Injectable()
export class SeriesScrapingEffects {
  scrapeSeries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(scrapeSeriesMetadata),
      tap(action => this.logger.debug('Fetching issues for series:', action)),
      switchMap(action =>
        this.metadataService
          .scrapeSeries({
            originalPublisher: action.originalPublisher,
            originalSeries: action.originalSeries,
            originalVolume: action.originalVolume,
            source: action.source,
            volume: action.volume
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant('scrape-series.effect-success', {
                  series: action.volume.name,
                  volume: action.volume.startYear
                })
              )
            ),
            map((response: ScrapeSeriesResponse) => {
              this.logger.trace('Redirecting to series issues page');
              this.router.navigate([
                '/library/collections/publishers',
                response.publisher,
                'series',
                response.series,
                'volumes',
                response.volume,
                'issues'
              ]);
              return scrapeSeriesMetadataSuccess();
            }),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant('scrape-series.effect-failure', {
                  series: action.volume.name,
                  volume: action.volume.startYear
                })
              );
              return of(scrapeSeriesMetadataFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(scrapeSeriesMetadataFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private router: Router,
    private metadataService: ComicBookScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
