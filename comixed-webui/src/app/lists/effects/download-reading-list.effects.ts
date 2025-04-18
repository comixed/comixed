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
  downloadReadingList,
  downloadReadingListFailed,
  readingListDownloaded
} from '../actions/download-reading-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DownloadDocument } from '@app/core/models/download-document';
import { FileDownloadService } from '@app/core/services/file-download.service';
import { of } from 'rxjs';

@Injectable()
export class DownloadReadingListEffects {
  downloadReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(downloadReadingList),
      tap(action => this.logger.trace('Downloading reading list:', action)),
      switchMap(action =>
        this.readingListService.downloadFile({ list: action.list }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: DownloadDocument) =>
            this.fileDownloadService.saveFile({ document: response })
          ),
          map(() => readingListDownloaded()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'reading-list.download-file.effect-failure',
                { name: action.list.name }
              )
            );
            return of(downloadReadingListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(downloadReadingListFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private readingListService: ReadingListService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private fileDownloadService: FileDownloadService
  ) {}
}
