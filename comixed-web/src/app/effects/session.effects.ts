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
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AlertService } from '@app/core';
import { SessionUpdateResponse } from '@app/models/net/session-update-response';
import { of } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { TranslateService } from '@ngx-translate/core';
import {
  loadSessionUpdate,
  loadSessionUpdateFailed,
  sessionUpdateLoaded
} from '@app/actions/session.actions';
import { SessionService } from '@app/services/session.service';
import { updateComics } from '@app/library';

@Injectable()
export class SessionEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private sessionService: SessionService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  loadSessionUpdate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadSessionUpdate),
      tap(action => this.logger.debug('Effect: load session update:', action)),
      switchMap(action =>
        this.sessionService
          .loadSessionUpdate({
            timestamp: action.timestamp,
            maximumRecords: action.maximumRecords,
            timeout: action.timeout
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            mergeMap((response: SessionUpdateResponse) => [
              updateComics({
                updated: response.update.updatedComics,
                removed: response.update.removedComicIds
              }),
              sessionUpdateLoaded({
                importCount: response.update.importCount,
                latest: response.update.latest
              })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant('session.load-effect-failure')
              );
              return of(loadSessionUpdateFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure-detail')
        );
        return of(loadSessionUpdateFailed());
      })
    );
  });
}
