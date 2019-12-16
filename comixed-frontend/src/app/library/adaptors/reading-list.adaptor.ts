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
  ReadingListCreate,
  ReadingListGet,
  ReadingListSave,
  ReadingListsLoad
} from 'app/library/actions/reading-list.actions';
import { ReadingList } from 'app/library/models/reading-list/reading-list';
import { ReadingListEntry } from 'app/library/models/reading-list/reading-list-entry';
import {
  READING_LIST_FEATURE_KEY,
  ReadingListState
} from 'app/library/reducers/reading-list.reducer';
import * as _ from 'lodash';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class ReadingListAdaptor {
  _updated$ = new BehaviorSubject<Date>(null);
  _reading_list$ = new BehaviorSubject<ReadingList[]>([]);
  _current_list$ = new BehaviorSubject<ReadingList>(null);

  constructor(private store: Store<AppState>, private logger: NGXLogger) {
    this.store
      .select(READING_LIST_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: ReadingListState) => {
        this.logger.debug('reading list state changed:', state);
        if (!_.isEqual(this._reading_list$.getValue(), state.reading_lists)) {
          this._reading_list$.next(state.reading_lists);
        }
        if (!_.isEqual(this._current_list$.getValue(), state.current_list)) {
          this._current_list$.next(state.current_list);
        }
        this._updated$.next(new Date());
      });
  }

  get reading_list$(): Observable<ReadingList[]> {
    return this._reading_list$.asObservable();
  }

  get_reading_lists(): void {
    this.store.dispatch(new ReadingListsLoad());
  }

  get current_list$(): Observable<ReadingList> {
    return this._current_list$.asObservable();
  }

  save(reading_list: ReadingList, entries: ReadingListEntry[]): void {
    this.logger.debug('saving reading list:', reading_list, entries);
    this.store.dispatch(
      new ReadingListSave({
        reading_list: {
          ...reading_list,
          entries: entries
        }
      })
    );
  }

  create_reading_list() {
    this.store.dispatch(new ReadingListCreate());
  }

  get_reading_list(id: number): void {
    this.store.dispatch(new ReadingListGet({ id: id }));
  }
}
