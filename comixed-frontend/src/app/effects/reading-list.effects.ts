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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import * as ReadingListActions from 'app/actions/reading-list.actions';
import { ReadingListSave } from 'app/actions/reading-list.actions';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ReadingList } from 'app/models/reading-list';
import { ReadingListService } from 'app/services/reading-list.service';

@Injectable()
export class ReadingListEffects {
  constructor(
    private actions$: Actions,
    private reading_list_service: ReadingListService
  ) {}

  @Effect()
  reading_list_get_all$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActions.READING_LIST_GET_ALL),
    exhaustMap(action => this.reading_list_service.get_reading_lists()),
    map(
      (response: Array<ReadingList>) =>
        new ReadingListActions.ReadingListGotList({ reading_lists: response })
    ),
    catchError(error => of(new ReadingListActions.ReadingListGetFailed()))
  );

  @Effect()
  reading_list_save$: Observable<Action> = this.actions$.pipe(
    ofType(ReadingListActions.READING_LIST_SAVE),
    map((action: ReadingListSave) => action.payload),
    exhaustMap(action =>
      this.reading_list_service.save_reading_list(action.reading_list)
    ),
    map(
      (response: ReadingList) =>
        new ReadingListActions.ReadingListSaved({ reading_list: response })
    ),
    catchError(error => of(new ReadingListActions.ReadingListSaveFailed()))
  );
}
