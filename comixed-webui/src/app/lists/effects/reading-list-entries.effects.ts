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
  addComicsToReadingList,
  addComicsToReadingListFailed,
  comicsAddedToReadingList,
  comicsRemovedFromReadingList,
  removeComicsFromReadingList,
  removeComicsFromReadingListFailed
} from '../actions/reading-list-entries.actions';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { LoggerService } from '@angular-ru/logger';
import { catchError, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ReadingList } from '@app/lists/models/reading-list';
import { readingListLoaded } from '@app/lists/actions/reading-list-detail.actions';
import { of } from 'rxjs';

@Injectable()
export class ReadingListEntriesEffects {
  addComicsToReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addComicsToReadingList),
      tap(action =>
        this.logger.trace('Adding comics to reading list:', action)
      ),
      switchMap(action =>
        this.readingListService
          .addComics({ list: action.list, comics: action.comics })
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
              comicsAddedToReadingList(),
              readingListLoaded({ list: response })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'reading-list-entries.add-comics.effect-failure'
                )
              );
              return of(addComicsToReadingListFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(addComicsToReadingListFailed());
      })
    );
  });

  removeComicsFromReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeComicsFromReadingList),
      tap(action =>
        this.logger.trace('Removing comics from reading list:', action)
      ),
      switchMap(action =>
        this.readingListService
          .removeComics({ list: action.list, comics: action.comics })
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
              comicsRemovedFromReadingList(),
              readingListLoaded({ list: response })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'reading-list-entries.remove-comics.effect-failure'
                )
              );
              return of(removeComicsFromReadingListFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(removeComicsFromReadingListFailed());
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
