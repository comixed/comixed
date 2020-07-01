/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { ComicImportService } from 'app/comic-import/services/comic-import.service';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  ComicImportActions,
  ComicImportActionTypes,
  ComicImportFilesReceived,
  ComicImportGetFilesFailed,
  ComicImportStarted,
  ComicImportStartFailed
} from '../actions/comic-import.actions';
import { LoggerService } from '@angular-ru/logger';

@Injectable()
export class ComicImportEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions<ComicImportActions>,
    private comicImportService: ComicImportService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getFiles$: Observable<Action> = this.actions$.pipe(
    ofType(ComicImportActionTypes.GetFiles),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: get comic files:', action)),
    switchMap(action =>
      this.comicImportService.getFiles(action.directory, action.maximum).pipe(
        tap(response => this.logger.debug('received response:', response)),
        tap((response: ComicFile[]) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-import-effects.get-files.success.detail',
              { count: response.length }
            )
          })
        ),
        map(
          (response: ComicFile[]) =>
            new ComicImportFilesReceived({ comicFiles: response })
        ),
        catchError(error => {
          this.logger.error('service failure getting comic files:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-import-effects.get-files.failure.detail'
            )
          });
          return of(new ComicImportGetFilesFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure getting comic files:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicImportGetFilesFailed());
    })
  );

  @Effect()
  startImport$: Observable<Action> = this.actions$.pipe(
    ofType(ComicImportActionTypes.Start),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: start import:', action)),
    switchMap(action =>
      this.comicImportService
        .startImport(
          action.comicFiles,
          action.ignoreMetadata,
          action.deleteBlockedPages
        )
        .pipe(
          tap(response => this.logger.debug('received response:', response)),
          tap(() =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'comic-import-effects.start-import.success.detail',
                { count: action.comicFiles.length }
              )
            })
          ),
          map(() => new ComicImportStarted()),
          catchError(error => {
            this.logger.error('service failure getting comic files:', error);
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'comic-import-effects.start-import.failure.details'
              )
            });
            return of(new ComicImportStartFailed());
          })
        )
    ),
    catchError(error => {
      this.logger.error('general failure getting comic files:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicImportStartFailed());
    })
  );
}
