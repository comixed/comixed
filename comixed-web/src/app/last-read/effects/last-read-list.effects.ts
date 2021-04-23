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
import { LastReadService } from '@app/last-read/services/last-read.service';
import { AlertService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import {
  lastReadDatesLoaded,
  loadLastReadDates,
  loadLastReadDatesFailed
} from '@app/last-read/actions/last-read-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoadLastReadEntriesResponse } from '@app/last-read/models/net/load-last-read-entries-response';
import { of } from 'rxjs';

@Injectable()
export class LastReadListEffects {
  loadEntries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadLastReadDates),
      tap(action =>
        this.logger.debug('Effect: load last read entries:', action)
      ),
      switchMap(action =>
        this.lastReadService.loadEntries({ lastId: action.lastId }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LoadLastReadEntriesResponse) =>
            lastReadDatesLoaded({
              entries: response.entries,
              lastPayload: response.lastPayload
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'last-read-list.load-entries.effect-failure'
              )
            );
            return of(loadLastReadDatesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadLastReadDatesFailed());
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
