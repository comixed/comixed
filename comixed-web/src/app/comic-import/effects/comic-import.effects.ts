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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/logger';
import { ComicImportService } from '@app/comic-import/services/comic-import.service';
import { AlertService, ApiResponse } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import {
  comicFilesLoaded,
  comicFilesSent,
  loadComicFiles,
  loadComicFilesFailed,
  sendComicFiles,
  sendComicFilesFailed
} from '@app/comic-import/actions/comic-import.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoadComicFilesResponse } from '@app/comic-import/models/net/load-comic-files-response';
import { of } from 'rxjs';

@Injectable()
export class ComicImportEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicImportService: ComicImportService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  loadComicFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicFiles),
      tap(action => this.logger.debug('Effect: load comic files:', action)),
      switchMap(action =>
        this.comicImportService
          .loadComicFiles({
            directory: action.directory,
            maximum: action.maximum
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: ApiResponse<LoadComicFilesResponse>) =>
              response.success
                ? this.alertService.info(
                    this.translateService.instant(
                      'load-comic-files.effect-success-detail',
                      { count: response.result.files.length }
                    )
                  )
                : this.alertService.error(
                    this.translateService.instant(
                      'load-comic-files.effect-failure-detail'
                    )
                  )
            ),
            map((response: ApiResponse<LoadComicFilesResponse>) =>
              response.success
                ? comicFilesLoaded({ files: response.result.files })
                : loadComicFilesFailed()
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'load-comic-files.effect-failure-detail'
                )
              );
              return of(loadComicFilesFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure-detail')
        );
        return of(loadComicFilesFailed());
      })
    );
  });

  sendComicFiles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendComicFiles),
      tap(action => this.logger.debug('Effect: send comic files:', action)),
      switchMap(action =>
        this.comicImportService
          .sendComicFiles({
            files: action.files,
            ignoreMetadata: action.ignoreMetadata,
            deleteBlockedPages: action.deleteBlockedPages
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: ApiResponse<void>) =>
              response.success
                ? this.alertService.info(
                    this.translateService.instant(
                      'send-comic-files.effect-success-detail',
                      { count: action.files.length }
                    )
                  )
                : this.alertService.error(
                    this.translateService.instant(
                      'send-comic-files.effect-failure-detail'
                    )
                  )
            ),
            map((response: ApiResponse<void>) =>
              response.success ? comicFilesSent() : sendComicFilesFailed()
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'send-comic-files.effect-failure-detail'
                )
              );
              return of(sendComicFilesFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure-detail')
        );
        return of(sendComicFilesFailed());
      })
    );
  });
}
