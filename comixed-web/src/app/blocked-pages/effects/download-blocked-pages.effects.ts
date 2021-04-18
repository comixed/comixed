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
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import { AlertService, DownloadDocument } from '@app/core';
import {
  blockedPagesDownloaded,
  downloadBlockedPages,
  downloadBlockedPagesFailed
} from '@app/blocked-pages/actions/download-blocked-pages.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FileSaverService } from 'ngx-filesaver';

@Injectable()
export class DownloadBlockedPagesEffects {
  downloadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(downloadBlockedPages),
      tap(action =>
        this.logger.debug('Effect: download blocked pages file:', action)
      ),
      switchMap(action =>
        this.blockedPageService.downloadFile().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: DownloadDocument) => {
            const byteChars = atob(response.content);
            const byteNumbers = new Array(byteChars.length);
            for (let index = 0; index < byteChars.length; index++) {
              byteNumbers[index] = byteChars.charCodeAt(index);
            }
            const byteArray = new Uint8Array(byteNumbers);
            this.fileSaverService.save(
              new Blob([byteArray], { type: response.mediaType }),
              response.filename
            );
          }),
          map((response: DownloadDocument) =>
            blockedPagesDownloaded({ document: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-page-list.download-file.effect-failure'
              )
            );
            return of(downloadBlockedPagesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(downloadBlockedPagesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private blockedPageService: BlockedPageService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private fileSaverService: FileSaverService
  ) {}
}
