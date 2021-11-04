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
import { LoggerService } from '@angular-ru/cdk/logger';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ReadingList } from '@app/lists/models/reading-list';
import { of } from 'rxjs';
import {
  deleteReadingLists,
  deleteReadingListsFailed,
  loadReadingLists,
  loadReadingListsFailed,
  readingListsDeleted,
  readingListsLoaded
} from '@app/lists/actions/reading-lists.actions';

@Injectable()
export class ReadingListsEffects {
  loadUserReadingLists$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadReadingLists),
      tap(action => this.logger.trace('Load reading lists for user:', action)),
      switchMap(action =>
        this.readingListService.loadReadingLists().pipe(
          tap(response => this.logger.trace('Response received:', response)),
          map((response: ReadingList[]) =>
            readingListsLoaded({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'reading-lists.load-for-user.effect-failure'
              )
            );
            return of(loadReadingListsFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadReadingListsFailed());
      })
    );
  });

  deleteReadingLists$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteReadingLists),
      tap(action => this.logger.trace('Delete reading lists:', action)),
      switchMap(action =>
        this.readingListService
          .deleteReadingLists({ lists: action.lists })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'reading-lists.delete-reading-lists.effect-success',
                  { count: action.lists.length }
                )
              )
            ),
            map(() => readingListsDeleted()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'reading-lists.delete-reading-lists.effect-failure',
                  { count: action.lists.length }
                )
              );
              return of(deleteReadingListsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteReadingListsFailed());
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
