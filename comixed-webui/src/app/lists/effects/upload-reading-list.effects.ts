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
  readingListUploaded,
  uploadReadingList,
  uploadReadingListFailed
} from '../actions/upload-reading-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class UploadReadingListEffects {
  uploadReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(uploadReadingList),
      tap(action => this.logger.trace('Uploading reading list:', action)),
      switchMap(action =>
        this.readingListService.uploadFile({ file: action.file }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'reading-list.upload-file.effect-success'
              )
            )
          ),
          map(() => readingListUploaded()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'reading-list.upload-file.effect-failure'
              )
            );
            return of(uploadReadingListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(uploadReadingListFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private readingListService: ReadingListService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
