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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  ImportActions,
  ImportActionTypes,
  ImportFilesReceived,
  ImportGetFiles,
  ImportGetFilesFailed,
  ImportStarted,
  ImportStart,
  ImportFailedToStart
} from '../actions/import.actions';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ImportService } from 'app/library/services/import.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ComicFile } from 'app/library';

@Injectable()
export class ImportEffects {
  constructor(
    private actions$: Actions<ImportActions>,
    private import_service: ImportService,
    private message_service: MessageService,
    private translate_service: TranslateService
  ) {}

  @Effect()
  get_comic_files$: Observable<Action> = this.actions$.pipe(
    ofType(ImportActionTypes.GetFiles),
    map((action: ImportGetFiles) => action.payload),
    switchMap(action =>
      this.import_service.get_comic_files(action.directory).pipe(
        tap((response: ComicFile[]) =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
              'import-effects.get-comic-files.success.detail',
              { count: response.length }
            )
          })
        ),
        map(response => new ImportFilesReceived({ comic_files: response })),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'import-effects.get-comic-files.error.detail'
            )
          });
          return of(new ImportGetFilesFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ImportGetFilesFailed());
    })
  );

  @Effect()
  import_comic_files$: Observable<Action> = this.actions$.pipe(
    ofType(ImportActionTypes.Start),
    map((action: ImportStart) => action.payload),
    switchMap(action =>
      this.import_service
        .import_comic_files(
          action.comic_files,
          action.delete_blocked_pages,
          action.ignore_metadata
        )
        .pipe(
          tap(response =>
            this.message_service.add({
              severity: 'info',
              detail: this.translate_service.instant(
                'import-effects.import-comic-files.success.detail'
              )
            })
          ),
          map((response: number) => new ImportStarted()),
          catchError(error => {
            this.message_service.add({
              severity: 'error',
              detail: this.translate_service.instant(
                'import-effects.import-comic-files.error.detail'
              )
            });
            return of(new ImportFailedToStart());
          })
        )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ImportFailedToStart());
    })
  );
}
