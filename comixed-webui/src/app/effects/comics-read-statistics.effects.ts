/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  loadComicsReadStatistics,
  loadComicsReadStatisticsFailure,
  loadComicsReadStatisticsSuccess
} from '../actions/comics-read-statistics.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/cdk/logger';
import { UserService } from '@app/user/services/user.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ComicsReadStatistic } from '@app/models/ui/comics-read-statistic';
import { of } from 'rxjs';

@Injectable()
export class ComicsReadStatisticsEffects {
  loadComicsReadStatistics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadComicsReadStatistics),
      tap(() => this.logger.debug('Loading comics read statistics')),
      switchMap(() =>
        this.userService.loadComicsReadStatistics().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ComicsReadStatistic[]) =>
            loadComicsReadStatisticsSuccess({ data: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'load-comics-read-statistics.effect-failure'
              )
            );
            return of(loadComicsReadStatisticsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadComicsReadStatisticsFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private userService: UserService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
