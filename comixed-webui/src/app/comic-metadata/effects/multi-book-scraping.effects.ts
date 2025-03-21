/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { of } from 'rxjs';
import {
  batchScrapeComicBooks,
  batchScrapeComicBooksFailure,
  batchScrapeComicBooksSuccess,
  loadMultiBookScrapingPage,
  loadMultiBookScrapingPageFailure,
  loadMultiBookScrapingPageSuccess,
  multiBookScrapeComic,
  multiBookScrapeComicFailure,
  multiBookScrapeComicSuccess,
  multiBookScrapingRemoveBook,
  multiBookScrapingRemoveBookFailure,
  multiBookScrapingRemoveBookSuccess,
  startMultiBookScraping,
  startMultiBookScrapingFailure,
  startMultiBookScrapingSuccess
} from '../actions/multi-book-scraping.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { StartMultiBookScrapingResponse } from '@app/comic-metadata/models/net/start-multi-book-scraping-response';
import { RemoveMultiBookComicResponse } from '@app/comic-metadata/models/net/remove-multi-book-comic-response';
import { LoadMultiBookScrapingResponse } from '@app/comic-metadata/models/net/load-multi-book-scraping-page-response';

@Injectable()
export class MultiBookScrapingEffects {
  startMultiBookScraping$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(startMultiBookScraping),
      tap(() => this.logger.debug('Starting multi-book comic scraping')),
      switchMap(action =>
        this.comicBookScrapingService
          .startMultiBookScraping({ pageSize: action.pageSize })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: StartMultiBookScrapingResponse) =>
              startMultiBookScrapingSuccess({
                pageSize: response.pageSize,
                pageNumber: response.pageNumber,
                totalComics: response.totalComics,
                comicBooks: response.comicBooks
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-book-scraping.start-process.effect-failure'
                )
              );
              return of(startMultiBookScrapingFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(startMultiBookScrapingFailure());
      })
    );
  });

  loadMultiBookScrapingPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMultiBookScrapingPage),
      tap(action =>
        this.logger.debug(
          'Loading a page of multi-book scraping comics:',
          action
        )
      ),
      switchMap(action =>
        this.comicBookScrapingService
          .loadMultiBookScrapingPage({
            pageSize: action.pageSize,
            pageNumber: action.pageNumber
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadMultiBookScrapingResponse) =>
              loadMultiBookScrapingPageSuccess({
                pageSize: response.pageSize,
                pageNumber: response.pageNumber,
                totalComics: response.totalComics,
                comicBooks: response.comicBooks
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-book-scraping.load-scraping-issues-page.effect-failure'
                )
              );
              return of(loadMultiBookScrapingPageFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadMultiBookScrapingPageFailure());
      })
    );
  });

  removeMultiBookComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(multiBookScrapingRemoveBook),
      tap(action =>
        this.logger.debug(
          'Removing comic book from multi-book scraping:',
          action
        )
      ),
      switchMap(action =>
        this.comicBookScrapingService
          .removeMultiBookComic({
            comicBook: action.comicBook,
            pageSize: action.pageSize
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'multi-book-scraping.remove-book.effect-success'
                )
              )
            ),
            map((response: RemoveMultiBookComicResponse) =>
              multiBookScrapingRemoveBookSuccess({
                pageSize: response.pageSize,
                pageNumber: response.pageNumber,
                totalComics: response.totalComics,
                comicBooks: response.comicBooks
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-book-scraping.remove-book.effect-failure'
                )
              );
              return of(multiBookScrapingRemoveBookFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(multiBookScrapingRemoveBookFailure());
      })
    );
  });

  multiBookScrapeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(multiBookScrapeComic),
      tap(action => this.logger.debug('Scraping mult-book comic:', action)),
      switchMap(action =>
        this.comicBookScrapingService
          .scrapeMultiBookComic({
            metadataSource: action.metadataSource,
            issueId: action.issueId,
            comicBook: action.comicBook,
            skipCache: action.skipCache,
            pageSize: action.pageSize
          })
          .pipe(
            tap(response => this.logger.debug('Response received;', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'multi-book-scraping.scrape-book.effect-success'
                )
              )
            ),
            map((response: StartMultiBookScrapingResponse) =>
              multiBookScrapeComicSuccess({
                pageSize: response.pageSize,
                pageNumber: response.pageNumber,
                totalComics: response.totalComics,
                comicBooks: response.comicBooks
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'multi-book-scraping.scrape-book.effect-failure'
                )
              );
              return of(multiBookScrapeComicFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(multiBookScrapeComicFailure());
      })
    );
  });

  batchScrapeComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(batchScrapeComicBooks),
      tap(action => this.logger.debug('Batch scraping comic books:', action)),
      switchMap(action =>
        this.comicBookScrapingService.batchScrapeComicBooks().pipe(
          tap(response => this.logger.debug('Response received;', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'multi-book-scraping.batch-scraping.effect-success'
              )
            )
          ),
          map(() => batchScrapeComicBooksSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'multi-book-scraping.batch-scraping.effect-failure'
              )
            );
            return of(batchScrapeComicBooksFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(batchScrapeComicBooksFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicBookScrapingService: ComicBookScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
