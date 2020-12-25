/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
  comicScraped,
  loadScrapingIssue,
  loadScrapingIssueFailed,
  loadScrapingVolumes,
  loadScrapingVolumesFailed,
  scrapeComic,
  scrapeComicFailed,
  scrapingIssueLoaded,
  scrapingVolumesLoaded
} from '@app/library/actions/scraping.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';
import { ScrapingService } from '@app/library/services/scraping.service';
import { ScrapingVolume } from '@app/library/models/scraping-volume';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core';
import { of } from 'rxjs';
import { ScrapingIssue } from '@app/library/models/scraping-issue';
import { Comic } from '@app/library';
import { comicLoaded } from '@app/library/actions/library.actions';

@Injectable()
export class ScrapingEffects {
  loadScrapingVolumes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadScrapingVolumes),
      tap(action =>
        this.logger.debug('Effect: load scraping volumes:', action)
      ),
      switchMap(action =>
        this.scrapingService
          .loadScrapingVolumes({
            apiKey: action.apiKey,
            series: action.series,
            maximumRecords: action.maximumRecords,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: ScrapingVolume[]) =>
              scrapingVolumesLoaded({ volumes: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.load-scraping-volumes.effect-failure'
                )
              );
              return of(loadScrapingVolumesFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadScrapingVolumesFailed());
      })
    );
  });

  loadScrapingIssue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadScrapingIssue),
      tap(action => this.logger.debug('Effect: load scraping issue:', action)),
      switchMap(action =>
        this.scrapingService
          .loadScrapingIssue({
            apiKey: action.apiKey,
            volumeId: action.volumeId,
            issueNumber: action.issueNumber,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: ScrapingIssue) =>
              scrapingIssueLoaded({ issue: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.load-scraping-issue.effect-failure'
                )
              );
              return of(loadScrapingIssueFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadScrapingIssueFailed());
      })
    );
  });

  scrapeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(scrapeComic),
      tap(action => this.logger.debug('Effect: scrape comic:', action)),
      switchMap(action =>
        this.scrapingService
          .scrapeComic({
            apiKey: action.apiKey,
            issueId: action.issueId,
            comic: action.comic,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(response =>
              this.alertService.info(
                this.translateService.instant(
                  'scraping.scrape-comic.effect-success'
                )
              )
            ),
            mergeMap((response: Comic) => [
              comicScraped(),
              comicLoaded({ comic: response })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.scrape-comic.effect-failure'
                )
              );
              return of(scrapeComicFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(scrapeComicFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private scrapingService: ScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
