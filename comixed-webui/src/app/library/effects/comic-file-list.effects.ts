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
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicFileService } from '@app/library/services/comic-file-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { UserActions } from '@app/account/actions/user.actions';
import { IMPORT_ROOT_DIRECTORY_PREFERENCE } from '@app/account/user-preferences';
import { ComicFileListActions } from '@app/library/actions/comic-file-list.actions';

@Injectable()
export class ComicFileListEffects {
  readonly logger = inject(LoggerService);
  readonly comicFileService = inject(ComicFileService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);
  loadFromSession$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicFileListActions.loadFromSession),
      tap(() => this.logger.debug('Loading comic files from session')),
      switchMap(() =>
        this.comicFileService.loadFromSession().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            ComicFileListActions.loadFromSessionSuccess({
              groups: response.groups
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-file-list-effects.load-from-sesison.service-failure'
              )
            );
            return of(ComicFileListActions.loadFromSessionFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicFileListActions.loadFromSessionFailure());
      })
    );
  });

  loadFromDisk$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicFileListActions.loadFromDisk),
      tap(action =>
        this.logger.debug('Loading comic files from file system:', action)
      ),
      switchMap(action =>
        this.comicFileService
          .loadFromDisk({
            directory: action.directory,
            maximum: action.maximum
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap(response => [
              ComicFileListActions.loadFromDiskSuccess({
                groups: response.groups
              }),
              UserActions.savePreference({
                name: IMPORT_ROOT_DIRECTORY_PREFERENCE,
                value: action.directory
              })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-file-list-effects.load-from-disk.service-failure',
                  { directory: action.directory }
                )
              );
              return of(ComicFileListActions.loadFromDiskFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicFileListActions.loadFromDiskFailure());
      })
    );
  });

  selectComicFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicFileListActions.select),
      tap(action =>
        this.logger.debug('Toggling comic file selections:', action)
      ),
      switchMap(action =>
        this.comicFileService
          .setComicFileSelected({
            filename: action.filename,
            selected: action.selected,
            single: action.single
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              ComicFileListActions.selectSuccess({ groups: response.groups })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-file-list-effects.select-comic-files.service-failure'
                )
              );
              return of(ComicFileListActions.selectFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicFileListActions.selectFailure());
      })
    );
  });

  import$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ComicFileListActions.import),
      tap(() => this.logger.debug('Importing comics')),
      switchMap(() =>
        this.comicFileService.import().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(() => ComicFileListActions.importSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-file-list-effects.import.service-failure'
              )
            );
            return of(ComicFileListActions.importFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ComicFileListActions.importFailure());
      })
    );
  });
}
