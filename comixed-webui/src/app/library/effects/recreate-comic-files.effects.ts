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
import { RecreateComicFilesActions } from '../actions/recreate-comic-files.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';

@Injectable()
export class RecreateComicFilesEffects {
  readonly logger = inject(LoggerService);
  readonly comicService = inject(ComicService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  recreateComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecreateComicFilesActions.recreateComic),
      tap(action => this.logger.debug('Recreating comic:', action)),
      switchMap(action =>
        this.comicService
          .recreateComic({
            comic: action.comic,
            archiveType: action.targetArchiveType
          })
          .pipe(
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'recreate-comic-files-effects.recreate-comic.service-success'
                )
              )
            ),
            map(() => RecreateComicFilesActions.recreateComicSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'recreate-comic-files-effects.recreate-comic.service-failure'
                )
              );
              return of(RecreateComicFilesActions.recreateComicFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(RecreateComicFilesActions.recreateComicFailure());
      })
    );
  });

  recreateSelectedComics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecreateComicFilesActions.recreateSelectedComics),
      tap(action => this.logger.debug('Recreating selected comics:', action)),
      switchMap(action =>
        this.comicService
          .recreateSelectedComics({
            archiveType: action.targetArchiveType
          })
          .pipe(
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'recreate-comic-files-effects.recreate-selected-comics.service-success',
                  {
                    targetArchiveType: action.targetArchiveType
                  }
                )
              )
            ),
            map(() =>
              RecreateComicFilesActions.recreateSelectedComicsSuccess()
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'recreate-comic-files-effects.recreate-selected-comics.service-failure'
                )
              );
              return of(
                RecreateComicFilesActions.recreateSelectedComicsFailure()
              );
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(RecreateComicFilesActions.recreateSelectedComicsFailure());
      })
    );
  });
}
