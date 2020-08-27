/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  comicFilesFound,
  findComicFiles,
  findComicFilesFailed
} from 'app/comic-import/actions/find-comic-files.actions';
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import { AlertService, ApiResponse } from 'app/core';
import { ComicImportService } from 'app/comic-import/services/comic-import.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { of } from 'rxjs';

@Injectable()
export class FindComicFilesEffects {
  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private translateService: TranslateService,
    private alertService: AlertService,
    private comicImportService: ComicImportService
  ) {}

  findComicFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(findComicFiles),
      tap(action => this.logger.debug('Effect: find comic files:', action)),
      switchMap(action =>
        this.comicImportService.getFiles(action.directory, action.maximum).pipe(
          tap(response => this.logger.debug('Received response:', response)),
          tap((response: ApiResponse<ComicFile[]>) =>
            response.success
              ? this.alertService.info(
                  this.translateService.instant(
                    'comic-import.effects.find-comic-files.success-detail',
                    { count: response.result.length }
                  )
                )
              : this.alertService.error(
                  this.translateService.instant(
                    'comic-import.effects.find-comic-files.error-detail'
                  )
                )
          ),
          map((response: ApiResponse<ComicFile[]>) =>
            response.success
              ? comicFilesFound({ comicFiles: response.result })
              : findComicFilesFailed()
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'comic-import.effects.find-comic-files.error-detail'
              )
            );
            return of(findComicFilesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(findComicFilesFailed());
      })
    );
  });
}
