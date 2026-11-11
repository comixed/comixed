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
import { SingleComicScrapingActions } from '../actions/single-comic-scraping.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicScrapingService } from '@app/metadata/services/comic-scraping-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class SingleComicScrapingEffects {
  readonly logger = inject(LoggerService);
  readonly comicScrapingService = inject(ComicScrapingService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  loadVolumes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SingleComicScrapingActions.loadVolumes),
      tap(action => this.logger.trace('Loading scraping volumes:', action)),
      switchMap(action =>
        this.comicScrapingService
          .loadVolumes({
            metadataSource: action.metadataSource,
            publisher: action.publisher,
            series: action.series,
            matchPublisher: action.matchPublisher,
            maxRecords: action.maximumRecords,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              SingleComicScrapingActions.loadVolumesSuccess({
                volumes: response
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'single-comic-scraping-effects.load-volumes.service-failure'
                )
              );
              return of(SingleComicScrapingActions.loadVolumesFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(SingleComicScrapingActions.loadVolumesFailure());
      })
    );
  });

  loadIssue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SingleComicScrapingActions.loadIssue),
      tap(action => this.logger.trace('Loading scraping issues:', action)),
      switchMap(action =>
        this.comicScrapingService
          .loadIssue({
            metadataSource: action.metadataSource,
            volumeId: action.volumeId,
            issueNumber: action.issueNumber,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(response => {
              if (!response) {
                this.alertService.info(
                  this.translateService.instant(
                    'single-comic-scraping-effects.load-issue.no-issue-found',
                    { sourceName: action.metadataSource.name }
                  )
                );
              }
            }),
            map(response =>
              SingleComicScrapingActions.loadIssueSuccess({
                issue: response
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'single-comic-scraping-effects.load-issue.service-failure'
                )
              );
              return of(SingleComicScrapingActions.loadIssueFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(SingleComicScrapingActions.loadIssueFailure());
      })
    );
  });

  scrapeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SingleComicScrapingActions.scrapeComic),
      tap(action => this.logger.trace('Scraping comic:', action)),
      switchMap(action =>
        this.comicScrapingService
          .scrapeIssue({
            metadataSource: action.metadataSource,
            issueId: action.issueId,
            comic: action.comic,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => SingleComicScrapingActions.scrapeComicSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'single-comic-scraping-effects.scrape-comic.service-failure'
                )
              );
              return of(SingleComicScrapingActions.scrapeComicFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(SingleComicScrapingActions.scrapeComicFailure());
      })
    );
  });
}
