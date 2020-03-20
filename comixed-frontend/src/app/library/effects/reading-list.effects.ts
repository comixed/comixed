/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ReadingList } from 'app/library/models/reading-list/reading-list';
import { ReadingListService } from 'app/library/services/reading-list.service';
import { LoggerService } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  ReadingListActions,
  ReadingListActionTypes,
  ReadingListGet,
  ReadingListGetFailed,
  ReadingListLoadFailed,
  ReadingListReceived,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed,
  ReadingListsLoaded
} from '../actions/reading-list.actions';

@Injectable()
export class ReadingListEffects {
  constructor(
    private actions$: Actions<ReadingListActions>,
    private readingListService: ReadingListService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private logger: LoggerService
  ) {}

  @Effect()
  getAll$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.GetAll),
    switchMap(action =>
      this.readingListService.get_all().pipe(
        tap((response: ReadingList[]) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'reading-list-effects.get-all.success.detail',
              { count: response.length }
            )
          })
        ),
        map(
          (response: ReadingList[]) =>
            new ReadingListsLoaded({ reading_lists: response })
        ),
        catchError(error => {
          this.logger.error('get all reading lists service failure:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'reading-list-effects.get-all.error.detail'
            )
          });
          return of(new ReadingListLoadFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('get all reading lists general failure:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListLoadFailed());
    })
  );

  @Effect()
  getReadingList$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.Get),
    map((action: ReadingListGet) => action.payload),
    switchMap(action =>
      this.readingListService.get_reading_list(action.id).pipe(
        tap((response: ReadingList) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'reading-list-effects.get-reading-list.success.detail',
              { name: response.name }
            )
          })
        ),
        map(
          (response: ReadingList) =>
            new ReadingListReceived({ reading_list: response })
        ),
        catchError(error => {
          this.logger.error('get reading list service failure:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'reading-list-effects.get-reading-list.error.detail'
            )
          });
          return of(new ReadingListGetFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('get reading list general failure:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListGetFailed());
    })
  );

  @Effect()
  savingReadingList$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.Save),
    map((action: ReadingListSave) => action.payload),
    switchMap(action =>
      this.readingListService.save_reading_list(action.reading_list).pipe(
        tap((response: ReadingList) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'reading-list-effects.save.success.detail',
              { name: response.name }
            )
          })
        ),
        map(
          (response: ReadingList) =>
            new ReadingListSaved({ reading_list: response })
        ),
        catchError(error => {
          this.logger.error('save reading list service failure:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'reading-list-effects.save.error.detail'
            )
          });
          return of(new ReadingListSaveFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('save reading list general failure:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListSaveFailed());
    })
  );
}
