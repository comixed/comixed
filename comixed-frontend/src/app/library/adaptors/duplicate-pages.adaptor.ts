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
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
import { BehaviorSubject, Observable } from 'rxjs';
import { DuplicatePage } from 'app/library/models/duplicate-page';
import {
  DUPLICATE_PAGES_FEATURE_KEY,
  DuplicatePagesState
} from 'app/library/reducers/duplicate-pages.reducer';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  DuplicatePagesDeselect,
  DuplicatePagesGetAll,
  DuplicatePagesSelect,
  DuplicatePagesSetBlocking,
  DuplicatePagesSetDeleted
} from 'app/library/actions/duplicate-pages.actions';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class DuplicatePagesAdaptors {
  private _fetchingAll$ = new BehaviorSubject<boolean>(false);
  private _pages$ = new BehaviorSubject<DuplicatePage[]>([]);
  private _selected$ = new BehaviorSubject<DuplicatePage[]>([]);
  private _setBlocking$ = new BehaviorSubject<boolean>(false);
  private _setDeleted$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>, private logger: NGXLogger) {
    this.store
      .select(DUPLICATE_PAGES_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((dupeState: DuplicatePagesState) => {
        this.logger.debug('duplicate page state updated:', dupeState);
        if (dupeState.fetchingAll !== this._fetchingAll$.getValue()) {
          this._fetchingAll$.next(dupeState.fetchingAll);
        }
        if (!_.isEqual(dupeState.pages, this._pages$.getValue())) {
          this._pages$.next(dupeState.pages);
        }
        if (!_.isEqual(dupeState.selected, this._selected$.getValue())) {
          this._selected$.next(dupeState.selected);
        }
        if (dupeState.setBlocking !== this._setBlocking$.getValue()) {
          this._setBlocking$.next(dupeState.setBlocking);
        }
        if (dupeState.setDeleted !== this._setDeleted$.getValue()) {
          this._setDeleted$.next(dupeState.setDeleted);
        }
      });
  }

  getAll(): void {
    this.logger.debug('getting all duplicate pages');
    this.store.dispatch(new DuplicatePagesGetAll());
  }

  get fetchingAll$(): Observable<boolean> {
    return this._fetchingAll$.asObservable();
  }

  get pages$(): Observable<DuplicatePage[]> {
    return this._pages$.asObservable();
  }

  selectPages(pages: DuplicatePage[]) {
    this.logger.debug(`selecting ${pages.length} page(s)`, pages);
    this.store.dispatch(new DuplicatePagesSelect({ pages: pages }));
  }

  get selected$(): Observable<DuplicatePage[]> {
    return this._selected$.asObservable();
  }

  deselectPages(pages: DuplicatePage[]) {
    this.logger.debug(`deselecting ${pages.length} page(s)`, pages);
    this.store.dispatch(new DuplicatePagesDeselect({ pages: pages }));
  }

  setBlocking(pages: DuplicatePage[], blocking: boolean): void {
    this.logger.debug(
      `${blocking ? 'Blocking' : 'Unblocking'} ${pages.length} page(s):`,
      pages
    );
    this.store.dispatch(
      new DuplicatePagesSetBlocking({ pages: pages, blocking: blocking })
    );
  }

  get setBlocking$(): Observable<boolean> {
    return this._setBlocking$.asObservable();
  }

  setDeleted(pages: DuplicatePage[], deleted: boolean): void {
    this.logger.debug(
      'firing action to set duplicate pages deleted state:',
      pages,
      deleted
    );
    this.store.dispatch(
      new DuplicatePagesSetDeleted({ pages: pages, deleted: deleted })
    );
  }

  get setDeleted$(): Observable<boolean> {
    return this._setDeleted$.asObservable();
  }
}
