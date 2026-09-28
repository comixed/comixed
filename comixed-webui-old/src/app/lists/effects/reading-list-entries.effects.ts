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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  addComicsToReadingListFailure,
  addComicsToReadingListSuccess,
  addSelectedComicsToReadingList,
  removeComicsFromReadingListFailure,
  removeComicsFromReadingListSuccess,
  removeSelectedComicsFromReadingList
} from '../actions/reading-list-entries.actions';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ReadingList } from '@app/lists/models/reading-list';
import { readingListLoaded } from '@app/lists/actions/reading-list-detail.actions';
import { of } from 'rxjs';

@Injectable()
export class ReadingListEntriesEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  readingListService = inject(ReadingListService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  addSelectedComicsToReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(addSelectedComicsToReadingList),
      tap(action =>
        this.logger.trace(
          'Adding selected comic books to reading list:',
          action
        )
      ),
      switchMap(action =>
        this.readingListService.addSelectedComics({ list: action.list }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'reading-list-entries.import-comic-files.effect-success',
                { name: action.list.name }
              )
            )
          ),
          map(() => addComicsToReadingListSuccess()),
          catchError(error => this.doAddingServiceFailure(error))
        )
      ),
      catchError(error => this.doAddingGeneralFailure(error))
    );
  });
  removeSelectedComicsFromReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(removeSelectedComicsFromReadingList),
      tap(action =>
        this.logger.trace('Removing comics from reading list:', action)
      ),
      switchMap(action =>
        this.readingListService
          .removeSelectedComics({
            list: action.list
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'reading-list-entries.remove-comics.effect-success',
                  { name: action.list.name }
                )
              )
            ),
            mergeMap((response: ReadingList) => [
              removeComicsFromReadingListSuccess(),
              readingListLoaded({ list: response })
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'reading-list-entries.remove-comics.effect-failure'
                )
              );
              return of(removeComicsFromReadingListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(removeComicsFromReadingListFailure());
      })
    );
  });

  private doAddingServiceFailure(error: any) {
    this.logger.error('Service failure:', error);
    this.alertService.error(
      this.translateService.instant(
        'reading-list-entries.import-comic-files.effect-failure'
      )
    );
    return of(addComicsToReadingListFailure());
  }

  private doAddingGeneralFailure(error: any) {
    this.logger.error('General failure:', error);
    this.alertService.error(
      this.translateService.instant('app.general-effect-failure')
    );
    return of(addComicsToReadingListFailure());
  }
}
