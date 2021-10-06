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
import {
  comicsMarkedDeleted,
  markComicsDeleted,
  markComicsDeletedFailed
} from '../actions/mark-comics-deleted.actions';
import { LoggerService } from '@angular-ru/logger';
import { ComicService } from '@app/comic-books/services/comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class MarkComicsDeletedEffects {
  markComicsDeleted$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markComicsDeleted),
      tap(action => this.logger.trace('Effect: mark comics deleted:', action)),
      switchMap(action =>
        this.comicService
          .markComicsDeleted({
            comics: action.comics,
            deleted: action.deleted
          })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-book.mark-as-deleted.effect-success',
                  { deleted: action.deleted }
                )
              )
            ),
            map(() => comicsMarkedDeleted()),
            catchError(error => {
              this.logger.error('General failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-book.mark-as-deleted.effect-failure',
                  { deleted: action.deleted }
                )
              );
              return of(markComicsDeletedFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(markComicsDeletedFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicService: ComicService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
