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
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicImportService } from '@app/comic-files/services/comic-import.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  loadComicFileListSuccess,
  loadComicFileLists,
  loadComicFileListFailure
} from '@app/comic-files/actions/comic-file-list.actions';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';

@Injectable()
export class ComicFileListEffects {
  loadComicFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicFileLists),
      tap(action => this.logger.debug('Effect: load comic files:', action)),
      switchMap(action =>
        this.comicImportService
          .loadComicFiles({
            directory: action.directory,
            maximum: action.maximum
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: LoadComicFilesResponse) =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-files.load-comic-files.effect-success',
                  {
                    directories: response.groups.length,
                    files: response.groups
                      .map(group => group.files)
                      .reduce(
                        (accumulator, files) => accumulator.concat(files),
                        []
                      ).length
                  }
                )
              )
            ),
            mergeMap((response: LoadComicFilesResponse) => [
              loadComicFileListSuccess({ groups: response.groups }),
              saveUserPreference({
                name: IMPORT_ROOT_DIRECTORY_PREFERENCE,
                value: action.directory
              }),
              saveUserPreference({
                name: IMPORT_MAXIMUM_RESULTS_PREFERENCE,
                value: `${action.maximum}`
              })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-files.load-comic-files.effect-failure'
                )
              );
              return of(loadComicFileListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicFileListFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicImportService: ComicImportService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
