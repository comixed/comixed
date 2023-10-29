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
  addComicBooksToReadingListFailure,
  addComicBooksToReadingListSuccess,
  addSelectedComicBooksToReadingList,
  removeComicBooksFromReadingListFailure,
  removeComicBooksFromReadingListSuccess,
  removeSelectedComicBooksFromReadingList
} from '../actions/reading-list-entries.actions';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ReadingList } from '@app/lists/models/reading-list';
import { readingListLoaded } from '@app/lists/actions/reading-list-detail.actions';
import { of } from 'rxjs';

@Injectable()
export class ReadingListEntriesEffects {
  adSelectedComicBooksToReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addSelectedComicBooksToReadingList),
      tap(action =>
        this.logger.trace(
          'Adding selected comic books to reading list:',
          action
        )
      ),
      switchMap(action =>
        this.readingListService
          .addSelectedComicBooks({ list: action.list })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: ReadingList) =>
              this.alertService.info(
                this.translateService.instant(
                  'reading-list-entries.add-comics.effect-success',
                  { name: response.name }
                )
              )
            ),
            mergeMap((response: ReadingList) => [
              addComicBooksToReadingListSuccess(),
              readingListLoaded({ list: response })
            ]),
            catchError(error => this.doAddingServiceFailure(error))
          )
      ),
      catchError(error => this.doAddingGeneralFailure(error))
    );
  });

  removeSelectedComicBooksFromReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeSelectedComicBooksFromReadingList),
      tap(action =>
        this.logger.trace('Removing comics from reading list:', action)
      ),
      switchMap(action =>
        this.readingListService
          .removeSelectedComicBooks({
            list: action.list
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: ReadingList) =>
              this.alertService.info(
                this.translateService.instant(
                  'reading-list-entries.remove-comics.effect-success',
                  { name: action.list.name }
                )
              )
            ),
            mergeMap((response: ReadingList) => [
              removeComicBooksFromReadingListSuccess(),
              readingListLoaded({ list: response })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'reading-list-entries.remove-comics.effect-failure'
                )
              );
              return of(removeComicBooksFromReadingListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(removeComicBooksFromReadingListFailure());
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

  private doAddingServiceFailure(error: any) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant(
        'reading-list-entries.add-comics.effect-failure'
      )
    );
    return of(addComicBooksToReadingListFailure());
  }

  private doAddingGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(addComicBooksToReadingListFailure());
  }
}
