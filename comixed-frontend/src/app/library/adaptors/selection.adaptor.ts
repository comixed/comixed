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
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState, Comic } from 'app/library';
import { Store } from '@ngrx/store';
import { SELECTION_FEATURE_KEY } from 'app/library/reducers/selection.reducer';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  SelectAddComic,
  SelectBulkAddComics,
  SelectBulkRemoveComics,
  SelectRemoveAllComics,
  SelectRemoveComic
} from 'app/library/actions/selection.actions';
import { SelectionState } from 'app/library/models/selection-state';

@Injectable()
export class SelectionAdaptor {
  private _comicSelection$ = new BehaviorSubject<Comic[]>([]);

  constructor(private store: Store<AppState>) {
    this.store
      .select(SELECTION_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: SelectionState) => {
        if (!_.isEqual(this._comicSelection$.getValue(), state.comics)) {
          this._comicSelection$.next(state.comics);
        }
      });
  }

  get comicSelection$(): Observable<Comic[]> {
    return this._comicSelection$.asObservable();
  }

  selectComic(comic: Comic): void {
    this.store.dispatch(new SelectAddComic({ comic: comic }));
  }

  selectComics(comics: Comic[]): void {
    this.store.dispatch(new SelectBulkAddComics({ comics: comics }));
  }

  deselectComic(comic: Comic): void {
    this.store.dispatch(new SelectRemoveComic({ comic: comic }));
  }

  deselectComics(comics: Comic[]): void {
    this.store.dispatch(new SelectBulkRemoveComics({ comics: comics }));
  }

  clearComicSelections(): void {
    this.store.dispatch(new SelectRemoveAllComics());
  }
}
