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
  loadIssueMetadata,
  loadIssueMetadataFailed,
  loadVolumeMetadata,
  loadVolumeMetadataFailed,
  scrapeComic,
  scrapeComicFailed,
  issueMetadataLoaded,
  volumeMetadataLoaded
} from '@app/comic-metadata/actions/metadata.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MetadataService } from '@app/comic-metadata/services/metadata.service';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { of } from 'rxjs';
import { IssueMetadata } from '@app/comic-metadata/models/issue-metadata';
import { Comic } from '@app/comic-books/models/comic';
import { comicLoaded } from '@app/comic-books/actions/comic.actions';

@Injectable()
export class MetadataEffects {
  loadScrapingVolumes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadVolumeMetadata),
      tap(action =>
        this.logger.debug('Effect: load scraping volumes:', action)
      ),
      switchMap(action =>
        this.scrapingService
          .loadScrapingVolumes({
            metadataSource: action.metadataSource,
            series: action.series,
            maximumRecords: action.maximumRecords,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: VolumeMetadata[]) =>
              volumeMetadataLoaded({ volumes: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.load-scraping-volumes.effect-failure'
                )
              );
              return of(loadVolumeMetadataFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadVolumeMetadataFailed());
      })
    );
  });

  loadScrapingIssue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadIssueMetadata),
      tap(action => this.logger.debug('Effect: load scraping issue:', action)),
      switchMap(action =>
        this.scrapingService
          .loadScrapingIssue({
            metadataSource: action.metadataSource,
            volumeId: action.volumeId,
            issueNumber: action.issueNumber,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: IssueMetadata) =>
              issueMetadataLoaded({ issue: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.load-scraping-issue.effect-failure'
                )
              );
              return of(loadIssueMetadataFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadIssueMetadataFailed());
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
            metadataSource: action.metadataSource,
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
    private scrapingService: MetadataService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
