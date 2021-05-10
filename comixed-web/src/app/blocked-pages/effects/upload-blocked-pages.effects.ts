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
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import {
  blockedPagesUploaded,
  uploadBlockedPages,
  uploadBlockedPagesFailed
} from '@app/blocked-pages/actions/upload-blocked-pages.actions';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { blockedPageListLoaded } from '@app/blocked-pages/actions/blocked-page-list.actions';
import { BlockedPage } from '@app/blocked-pages/models/blocked-page';
import { AlertService } from '@app/core/services/alert.service';

@Injectable()
export class UploadBlockedPagesEffects {
  uploadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(uploadBlockedPages),
      tap(action =>
        this.logger.debug('Effect: upload blocked page file:', action)
      ),
      switchMap(action =>
        this.blockedPageService.uploadFile({ file: action.file }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: BlockedPage[]) =>
            this.alertService.info(
              this.translateService.instant(
                'blocked-page-list.upload-file.effect-success',
                { count: response.length }
              )
            )
          ),
          mergeMap((response: BlockedPage[]) => [
            blockedPagesUploaded({ entries: response }),
            blockedPageListLoaded({ entries: response })
          ]),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-page-list.upload-file.effect-failure'
              )
            );
            return of(uploadBlockedPagesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(uploadBlockedPagesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private blockedPageService: BlockedPageService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
