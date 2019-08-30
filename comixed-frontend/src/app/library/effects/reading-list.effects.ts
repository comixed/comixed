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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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
import { ReadingListService } from 'app/library/services/reading-list.service';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ReadingList } from 'app/library/models/reading-list/reading-list';

@Injectable()
export class ReadingListEffects {
  constructor(
    private actions$: Actions<ReadingListActions>,
    private reading_list_service: ReadingListService,
    private translate_service: TranslateService,
    private message_service: MessageService
  ) {}

  @Effect()
  get_all$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.LoadReadingLists),
    switchMap(action =>
      this.reading_list_service.get_all().pipe(
        tap((response: ReadingList[]) =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
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
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'reading-list-effects.get-all.error.detail'
            )
          });
          return of(new ReadingListLoadFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListLoadFailed());
    })
  );

  @Effect()
  get_reading_list$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.GetReadingList),
    map((action: ReadingListGet) => action.payload),
    switchMap(action =>
      this.reading_list_service.get_reading_list(action.id).pipe(
        tap((response: ReadingList) =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
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
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'reading-list-effects.get-reading-list.error.detail'
            )
          });
          return of(new ReadingListGetFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListGetFailed());
    })
  );

  @Effect()
  save_reading_list$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActionTypes.SaveReadingList),
    map((action: ReadingListSave) => action.payload),
    switchMap(action =>
      this.reading_list_service.save_reading_list(action.reading_list).pipe(
        tap((response: ReadingList) =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
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
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'reading-list-effects.save.error.detail'
            )
          });
          return of(new ReadingListSaveFailed());
        })
      )
    ),
    catchError(error => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReadingListSaveFailed());
    })
  );
}
