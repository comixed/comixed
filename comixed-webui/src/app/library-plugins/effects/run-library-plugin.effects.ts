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
  runLibraryPluginFailure,
  runLibraryPluginOnOneComicBook,
  runLibraryPluginOnSelectedComicBooks,
  runLibraryPluginSuccess
} from '../actions/run-library-plugin.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryPluginService } from '@app/library-plugins/services/library-plugin.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class RunLibraryPluginEffects {
  runLibraryPluginOnOneComicBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(runLibraryPluginOnOneComicBook),
      tap(action =>
        this.logger.trace(
          'Running library plugin against one comic book:',
          action
        )
      ),
      switchMap(action =>
        this.libraryPluginService
          .runLibraryPluginOnOneComicBook({
            plugin: action.plugin,
            comicBookId: action.comicBookId
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'run-library-plugin.one-comic-book.effect-success',
                  { name: action.plugin.name }
                )
              )
            ),
            map(() => runLibraryPluginSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'run-library-plugin.one-comic-book.effect-failure',
                  { name: action.plugin.name }
                )
              );
              return of(runLibraryPluginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(runLibraryPluginFailure());
      })
    );
  });

  runLibraryPluginOnSelectedComicBooks$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(runLibraryPluginOnSelectedComicBooks),
      tap(action =>
        this.logger.trace(
          'Running library plugin against selected comic books:',
          action
        )
      ),
      switchMap(action =>
        this.libraryPluginService
          .runLibraryPluginOnSelectedComicBooks({ plugin: action.plugin })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'run-library-plugin.selected-comic-books.effect-success',
                  { name: action.plugin.name }
                )
              )
            ),
            map(() => runLibraryPluginSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'run-library-plugin.selected-comic-books.effect-failure',
                  { name: action.plugin.name }
                )
              );
              return of(runLibraryPluginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(runLibraryPluginFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private libraryPluginService: LibraryPluginService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
