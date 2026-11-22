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
import { MultiComicScrapingActions } from '../actions/multi-comic-scraping.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicScrapingService } from '@app/metadata/services/comic-scraping-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';

@Injectable()
export class MultiComicScrapingEffects {
  readonly logger = inject(LoggerService);
  readonly comicScrapingService = inject(ComicScrapingService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly router = inject(Router);

  private actions$ = inject(Actions);

  startScraping$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MultiComicScrapingActions.startScraping),
      tap(action =>
        this.logger.debug('Starting multi-comic scraping:', action)
      ),
      switchMap(action =>
        this.comicScrapingService
          .startMultiComicScraping({
            index: 0,
            size: action.size
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(response => {
              if (response.comics.length > 0) {
                this.router.navigateByUrl('/admin/library/scraping/multi');
              }
            }),
            map(response =>
              MultiComicScrapingActions.startScrapingSuccess({
                entries: response.comics,
                total: response.totalComics,
                index: response.pageNumber,
                size: response.pageSize
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-comic-scraping-effects.start-scraping.service-failure'
                )
              );
              return of(MultiComicScrapingActions.startScrapingFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(MultiComicScrapingActions.startScrapingFailure());
      })
    );
  });

  loadComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MultiComicScrapingActions.loadComics),
      tap(action =>
        this.logger.debug('Loading multi-comic scraping state:', action)
      ),
      switchMap(action =>
        this.comicScrapingService
          .loadMultiComicScraping({
            index: action.index,
            size: action.size
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              MultiComicScrapingActions.loadComicsSuccess({
                entries: response.comics,
                total: response.totalComics,
                index: response.pageNumber,
                size: response.pageSize
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-comic-scraping-effects.load-comics.service-failure'
                )
              );
              return of(MultiComicScrapingActions.loadComicsFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(MultiComicScrapingActions.loadComicsFailure());
      })
    );
  });

  removeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MultiComicScrapingActions.removeComic),
      tap(action => this.logger.debug('Removing comic from queue:', action)),
      switchMap(action =>
        this.comicScrapingService
          .removeMultiComicScraping({
            comic: action.entry,
            size: 10
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'multi-comic-scraping-effects.remove-comic.service-success'
                )
              )
            ),
            map(response =>
              MultiComicScrapingActions.removeComicSuccess({
                entries: response.comics,
                total: response.totalComics,
                index: response.pageNumber,
                size: response.pageSize
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-comic-scraping-effects.remove-comic.service-failure'
                )
              );
              return of(MultiComicScrapingActions.removeComicFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(MultiComicScrapingActions.removeComicFailure());
      })
    );
  });

  scrapeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MultiComicScrapingActions.scrapeComic),
      tap(action => this.logger.debug('Scraping multi-comic entry:', action)),
      switchMap(action =>
        this.comicScrapingService
          .scrapeMultiComicEntry({
            comic: action.comic,
            metadataSource: action.metadataSource,
            issueId: action.issueId,
            skipCache: action.skipCache,
            index: action.index,
            size: action.size
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap(response => [
              MultiComicScrapingActions.scrapeComicSuccess({
                entries: response.comics,
                total: response.totalComics,
                index: response.pageNumber,
                size: response.pageSize
              }),
              SingleComicScrapingActions.resetVolumes()
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-comic-scraping-effects.scrape-comic.service-failure'
                )
              );
              return of(MultiComicScrapingActions.scrapeComicFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(MultiComicScrapingActions.scrapeComicFailure());
      })
    );
  });
}
