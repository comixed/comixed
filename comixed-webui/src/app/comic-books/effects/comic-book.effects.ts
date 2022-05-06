/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { ComicBookService } from '@app/comic-books/services/comic-book.service';
import {
  comicBookLoaded,
  comicBookUpdated,
  loadComicBook,
  loadComicBookFailed,
  pageDeletionUpdated,
  pageOrderSaved,
  savePageOrder,
  savePageOrderFailed,
  updateComicBook,
  updateComicBookFailed,
  updatePageDeletion,
  updatePageDeletionFailed
} from '@app/comic-books/actions/comic-book.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { of } from 'rxjs';

@Injectable()
export class ComicBookEffects {
  loadOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicBook),
      tap(action => this.logger.debug('Effect: load comic:', action)),
      switchMap(action =>
        this.comicService.loadOne({ id: action.id }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ComicBook) =>
            comicBookLoaded({ comicBook: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-book.load-comic.effect-failure'
              )
            );
            return of(loadComicBookFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicBookFailed());
      })
    );
  });

  saveOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateComicBook),
      tap(action => this.logger.debug('Effect: update comic:', action)),
      switchMap(action =>
        this.comicService.updateOne({ comicBook: action.comicBook }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-book.save-changes.effect-success'
              )
            )
          ),
          map((response: ComicBook) =>
            comicBookUpdated({ comicBook: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-book.save-changes.effect-failure'
              )
            );
            return of(updateComicBookFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateComicBookFailed());
      })
    );
  });

  updatePageDeletion$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updatePageDeletion),
      tap(action => this.logger.trace('Updating page deletion:', action)),
      switchMap(action =>
        this.comicService
          .updatePageDeletion({ pages: action.pages, deleted: action.deleted })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-page.update-page-deletion.effect-success',
                  {
                    count: action.pages.length,
                    deleted: action.deleted
                  }
                )
              )
            ),
            map(() => pageDeletionUpdated()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-page.update-page-deletion.effect-failure',
                  {
                    count: action.pages.length,
                    deleted: action.deleted
                  }
                )
              );
              return of(updatePageDeletionFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updatePageDeletionFailed());
      })
    );
  });

  savePageOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(savePageOrder),
      tap(action => this.logger.trace('Saving page order:', action)),
      switchMap(action =>
        this.comicService
          .savePageOrder({
            comicBook: action.comicBook,
            entries: action.entries
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-book.save-page-order.effect-success'
                )
              )
            ),
            map(() => pageOrderSaved()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-book.save-page-order.effect-failure'
                )
              );
              return of(savePageOrderFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(savePageOrderFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: ComicBookService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
