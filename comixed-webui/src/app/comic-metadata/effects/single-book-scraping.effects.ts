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
  clearMetadataCache,
  clearMetadataCacheFailure,
  clearMetadataCacheSuccess,
  issueMetadataLoaded,
  loadIssueMetadata,
  loadIssueMetadataFailed,
  loadVolumeMetadata,
  loadVolumeMetadataFailed,
  scrapeSingleComicBook,
  scrapeSingleComicBookFailure,
  scrapeSingleComicBookSuccess,
  startMetadataUpdateProcess,
  startMetadataUpdateProcessFailure,
  startMetadataUpdateProcessSuccess,
  volumeMetadataLoaded
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { of } from 'rxjs';
import { IssueMetadata } from '@app/comic-metadata/models/issue-metadata';
import {
  clearComicBookSelectionState,
  removeSingleComicBookSelection
} from '@app/comic-books/actions/comic-book-selection.actions';

@Injectable()
export class SingleBookScrapingEffects {
  loadScrapingVolumes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadVolumeMetadata),
      tap(action =>
        this.logger.debug('Effect: load scraping volumes:', action)
      ),
      switchMap(action =>
        this.metadataService
          .loadScrapingVolumes({
            metadataSource: action.metadataSource,
            publisher: action.publisher || '',
            series: action.series,
            maximumRecords: action.maximumRecords,
            skipCache: action.skipCache,
            matchPublisher: action.matchPublisher
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
        this.metadataService
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

  scrapeSingleComicBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(scrapeSingleComicBook),
      tap(action => this.logger.debug('Effect: scrape comic:', action)),
      switchMap(action =>
        this.metadataService
          .scrapeSingleBookComic({
            metadataSource: action.metadataSource,
            issueId: action.issueId,
            comicBook: action.comic,
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
            mergeMap(() => [
              scrapeSingleComicBookSuccess(),
              removeSingleComicBookSelection({
                comicBookId: action.comic.comicBookId
              })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.scrape-comic.effect-failure'
                )
              );
              return of(scrapeSingleComicBookFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(scrapeSingleComicBookFailure());
      })
    );
  });

  startMetadataUpdateProcess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(startMetadataUpdateProcess),
      tap(action =>
        this.logger.trace('Starting metadata update process:', action)
      ),
      switchMap(action =>
        this.metadataService
          .startMetadataUpdateProcess({
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'metadata-process.start-process.effect-success'
                )
              )
            ),
            mergeMap(() => [
              startMetadataUpdateProcessSuccess(),
              clearComicBookSelectionState()
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'metadata-process.start-process.effect-failure'
                )
              );
              return of(startMetadataUpdateProcessFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(startMetadataUpdateProcessFailure());
      })
    );
  });

  clearCache$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearMetadataCache),
      tap(action => this.logger.trace('Clearing metadata cache:', action)),
      switchMap(() =>
        this.metadataService.clearCache().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'metadata-cache.clear-cache.effect-success'
              )
            )
          ),
          map(() => clearMetadataCacheSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-cache.clear-cache.effect-failure'
              )
            );
            return of(clearMetadataCacheFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(clearMetadataCacheFailure());
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
