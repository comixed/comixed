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
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import { LastReadService } from '@app/last-read/services/last-read.service';
import {
  comicReadStatusUpdated,
  updateComicReadStatus,
  updateComicReadStatusFailed
} from '@app/last-read/actions/update-read-status.actions';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  lastReadDateRemoved,
  lastReadDateUpdated
} from '@app/last-read/actions/last-read-list.actions';
import { LastRead } from '@app/last-read/models/last-read';
import { AlertService } from '@app/core/services/alert.service';

@Injectable()
export class UpdateReadStatusEffects {
  updateStatus$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateComicReadStatus),
      tap(action =>
        this.logger.debug('Effect: updating comic read status:', action)
      ),
      switchMap(action =>
        this.lastReadService
          .setStatus({ comic: action.comic, status: action.status })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'update-read-status.effect-success',
                  { status: action.status }
                )
              )
            ),
            mergeMap((response: LastRead) => [
              comicReadStatusUpdated(),
              action.status
                ? lastReadDateUpdated({ entry: response })
                : lastReadDateRemoved({ entry: response })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'update-read-status.effect-failure',
                  { status: action.status }
                )
              );
              return of(updateComicReadStatusFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateComicReadStatusFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private lastReadService: LastReadService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
