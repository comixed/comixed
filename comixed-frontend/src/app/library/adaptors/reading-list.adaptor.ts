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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
import {
  ReadingListCancelEdit,
  ReadingListCreate,
  ReadingListEdit,
  ReadingListSave
} from 'app/library/actions/reading-list.actions';
import {
  READING_LIST_FEATURE_KEY,
  ReadingListState
} from 'app/library/reducers/reading-list.reducer';
import * as _ from 'lodash';
import { LoggerService } from '@angular-ru/logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReadingList } from 'app/comics/models/reading-list';

@Injectable()
export class ReadingListAdaptor {
  private _updated$ = new BehaviorSubject<Date>(null);
  private _current$ = new BehaviorSubject<ReadingList>(null);
  private _editing$ = new BehaviorSubject<boolean>(false);
  private _saving$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>, private logger: LoggerService) {
    this.store
      .select(READING_LIST_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: ReadingListState) => {
        this.logger.debug('reading list state changed:', state);
        if (!_.isEqual(this._current$.getValue(), state.current)) {
          this._current$.next(state.current);
        }
        if (this._editing$.getValue() !== state.editingList) {
          this._editing$.next(state.editingList);
        }
        if (this._saving$.getValue() !== state.savingList) {
          this._saving$.next(state.savingList);
        }
        this._updated$.next(new Date());
      });
  }

  save(id: number, name: string, summary: string): void {
    this.logger.debug(
      `firing action to save a reading list: id=${id} name=${name}`
    );
    this.store.dispatch(
      new ReadingListSave({
        id: id,
        name: name,
        summary: summary
      })
    );
  }

  create() {
    this.logger.debug('firing action to reading a reading list:');
    this.store.dispatch(new ReadingListCreate());
  }

  edit(readingList: ReadingList) {
    this.logger.debug('firing action to edit a reading list:', readingList);
    this.store.dispatch(new ReadingListEdit({ readingList: readingList }));
  }

  cancelEdit() {
    this.logger.debug('firing action to cancel editing a reading list');
    this.store.dispatch(new ReadingListCancelEdit());
  }

  get current$(): Observable<ReadingList> {
    return this._current$.asObservable();
  }

  get editing$(): Observable<boolean> {
    return this._editing$.asObservable();
  }

  get saving$(): Observable<boolean> {
    return this._saving$.asObservable();
  }
}
