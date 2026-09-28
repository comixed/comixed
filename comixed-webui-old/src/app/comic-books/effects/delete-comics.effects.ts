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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  deleteComicsFailure,
  deleteComicsSuccess,
  deleteSelectedComics,
  deleteSingleComic,
  undeleteSelectedComics,
  undeleteSingleComic
} from '../actions/delete-comic-books.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicService } from '@app/comic-books/services/comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class DeleteComicsEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  comicService = inject(ComicService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  deleteSingleComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteSingleComic),
      tap(action =>
        this.logger.trace('Effect: delete a single comic book:', action)
      ),
      switchMap(action =>
        this.comicService
          .deleteSingleComic({
            comicId: action.comicId
          })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-book.mark-as-deleted.effect-success',
                  { deleted: true }
                )
              )
            ),
            map(() => deleteComicsSuccess()),
            catchError(error => this.doServiceFailure(error, true))
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteComicsFailure());
      })
    );
  });
  undeleteSingleComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undeleteSingleComic),
      tap(action =>
        this.logger.trace('Effect: undelete a single comic book:', action)
      ),
      switchMap(action =>
        this.comicService.undeleteSingleComic({ comicId: action.comicId }).pipe(
          tap(response => this.logger.trace('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-book.mark-as-deleted.effect-success',
                { deleted: false }
              )
            )
          ),
          map(() => deleteComicsSuccess()),
          catchError(error => this.doServiceFailure(error, false))
        )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  deleteSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteSelectedComics),
      tap(action =>
        this.logger.trace('Effect: deleting selected comic books:', action)
      ),
      switchMap(() =>
        this.comicService.deleteSelectedComics().pipe(
          tap(response => this.logger.trace('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-book.mark-as-deleted.effect-success',
                { deleted: true }
              )
            )
          ),
          map(() => deleteComicsSuccess()),
          catchError(error => this.doServiceFailure(error, true))
        )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });
  undeleteSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(undeleteSelectedComics),
      tap(action =>
        this.logger.trace('Effect: undeleted selected comic books:', action)
      ),
      switchMap(() =>
        this.comicService.undeleteSelectedComics().pipe(
          tap(response => this.logger.trace('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'comic-book.mark-as-deleted.effect-success',
                { deleted: false }
              )
            )
          ),
          map(() => deleteComicsSuccess()),
          catchError(error => this.doServiceFailure(error, false))
        )
      ),
      catchError(error => this.doGeneralFailure(error))
    );
  });

  private doServiceFailure(error: any, deleted: boolean) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant(
        'comic-book.mark-as-deleted.effect-failure',
        { deleted }
      )
    );
    return of(deleteComicsFailure());
  }

  private doGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(deleteComicsFailure());
  }
}
