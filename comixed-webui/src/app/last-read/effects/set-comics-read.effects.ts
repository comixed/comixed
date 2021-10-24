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
  comicsReadSet,
  setComicsRead,
  setComicsReadFailed
} from '@app/last-read/actions/set-comics-read.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AlertService } from '@app/core/services/alert.service';
import { of } from 'rxjs';
import { LastRead } from '@app/last-read/models/last-read';

@Injectable()
export class SetComicsReadEffects {
  setComicsRead$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setComicsRead),
      tap(action =>
        this.logger.debug('Effect: updating comic read status:', action)
      ),
      switchMap(action =>
        this.lastReadService
          .setRead({ comics: action.comics, read: action.read })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'update-read-status.effect-success',
                  { status: action.read }
                )
              )
            ),
            map((response: LastRead) => comicsReadSet()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'update-read-status.effect-failure',
                  { status: action.read }
                )
              );
              return of(setComicsReadFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setComicsReadFailed());
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
