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
import {
  comicFilesSent,
  sendComicFiles,
  sendComicFilesFailed
} from '@app/comic-files/actions/import-comic-files.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicImportService } from '@app/comic-files/services/comic-import.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { clearComicFileSelections } from '@app/comic-files/actions/comic-file-list.actions';

@Injectable()
export class ImportComicFilesEffects {
  sendComicFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendComicFiles),
      tap(action => this.logger.debug('Effect: send comic files:', action)),
      switchMap(action =>
        this.comicImportService
          .sendComicFiles({
            files: action.files
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'comic-files.send-comic-files.effect-success',
                  { count: action.files.length }
                )
              )
            ),
            mergeMap(() => [comicFilesSent(), clearComicFileSelections()]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'comic-files.send-comic-files.effect-failure'
                )
              );
              return of(sendComicFilesFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(sendComicFilesFailed());
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
