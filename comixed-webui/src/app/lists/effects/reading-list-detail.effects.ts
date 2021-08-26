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
  loadReadingList,
  loadReadingListFailed,
  readingListLoaded,
  readingListSaved,
  saveReadingList,
  saveReadingListFailed
} from '../actions/reading-list-detail.actions';
import { LoggerService } from '@angular-ru/logger';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ReadingList } from '@app/lists/models/reading-list';
import { of } from 'rxjs';

@Injectable()
export class ReadingListDetailEffects {
  loadReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadReadingList),
      tap(action => this.logger.trace('Loading one reading list:', action)),
      switchMap(action =>
        this.readingListService.loadOne({ id: action.id }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: ReadingList) => readingListLoaded({ list: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'reading-list.load-one.effect-failure'
              )
            );
            return of(loadReadingListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadReadingListFailed());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveReadingList),
      tap(action => this.logger.trace('Save reading list:', action)),
      switchMap(action =>
        this.readingListService.save({ list: action.list }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'reading-list.save-changes.effect-success'
              )
            )
          ),
          map((response: ReadingList) => readingListSaved({ list: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'reading-list.save-changes.effect-failure'
              )
            );
            return of(saveReadingListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveReadingListFailed());
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
