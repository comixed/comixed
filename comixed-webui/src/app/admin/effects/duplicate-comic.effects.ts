/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/cdk/logger';
import { DuplicateComicService } from '@app/admin/services/duplicate-comic-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { DuplicateComicActions } from '@app/admin/actions/duplicate-comic.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class DuplicateComicEffects {
  readonly logger = inject(LoggerService);
  readonly duplicateComicService = inject(DuplicateComicService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DuplicateComicActions.load),
      tap(action => this.logger.trace('Loading duplicated comic:', action)),
      switchMap(action =>
        this.duplicateComicService
          .loadOne({
            publisher: action.publisher,
            series: action.series,
            volume: action.volume,
            issueNumber: action.issueNumber,
            coverDate: action.coverDate,
            index: action.index,
            size: action.size,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              DuplicateComicActions.loadSuccess({
                entries: response.comics,
                coverMonths: response.coverMonths,
                coverYears: response.coverYears,
                total: response.totalCount
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'duplicate-comic-effects.load.service-failure'
                )
              );
              return of(DuplicateComicActions.loadFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(DuplicateComicActions.loadFailure());
      })
    );
  });
}
