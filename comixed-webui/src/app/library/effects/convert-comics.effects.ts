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
  comicsConverting,
  convertComics,
  convertComicsFailed
} from '../actions/convert-comics.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryService } from '@app/library/services/library.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ConvertComicsEffects {
  convertComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(convertComics),
      tap(action => this.logger.trace('Converting comics:', action)),
      switchMap(action =>
        this.libraryService
          .convertComics({
            comicBooks: action.comicBooks,
            archiveType: action.archiveType,
            renamePages: action.renamePages,
            deletePages: action.deletePages
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'library.convert-comics.effect-success',
                  {
                    count: action.comicBooks.length,
                    archiveType: action.archiveType
                  }
                )
              )
            ),
            map(() => comicsConverting()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'library.convert-comics.effect-failure'
                )
              );
              return of(convertComicsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(convertComicsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private libraryService: LibraryService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
