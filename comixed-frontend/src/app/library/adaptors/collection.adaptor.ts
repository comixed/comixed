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
  COLLECTION_FEATURE_KEY,
  CollectionState
} from 'app/library/reducers/collection.reducer';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { CollectionType } from 'app/library/models/collection-type.enum';
import { BehaviorSubject, Observable } from 'rxjs';
import { CollectionEntry } from 'app/library/models/collection-entry';
import {
  CollectionGetComics,
  CollectionLoad
} from 'app/library/actions/collection.actions';
import { Comic } from 'app/comics';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class CollectionAdaptor {
  private _fetchingEntries$ = new BehaviorSubject<boolean>(false);
  private _entries$ = new BehaviorSubject<CollectionEntry[]>([]);
  private _fetchingEntry$ = new BehaviorSubject<boolean>(false);
  private _comics$ = new BehaviorSubject<Comic[]>([]);
  private _comicCount$ = new BehaviorSubject<number>(0);

  constructor(private store: Store<AppState>, private logger: NGXLogger) {
    this.store
      .select(COLLECTION_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: CollectionState) => {
        this.logger.debug('collection state updated:', state);
        if (state.fetchingEntries !== this._fetchingEntries$.getValue()) {
          this._fetchingEntries$.next(state.fetchingEntries);
        }
        if (!_.isEqual(state.entries, this._entries$.getValue())) {
          this._entries$.next(state.entries);
        }
        if (state.fetchingEntry !== this._fetchingEntry$.getValue()) {
          this._fetchingEntry$.next(state.fetchingEntry);
        }
        if (!_.isEqual(state.comics, this._comics$.getValue())) {
          this._comics$.next(state.comics);
        }
        if (state.comicCount !== this._comicCount$.getValue()) {
          this._comicCount$.next(state.comicCount);
        }
      });
  }

  getCollection(collectionType: CollectionType): void {
    this.logger.debug('getting collection:', collectionType);
    this.store.dispatch(new CollectionLoad({ collectionType: collectionType }));
  }

  get fetchingEntries$(): Observable<boolean> {
    return this._fetchingEntries$.asObservable();
  }

  get entries$(): Observable<CollectionEntry[]> {
    return this._entries$.asObservable();
  }

  getPageForEntry(
    collectionType: CollectionType,
    name: string,
    page: number,
    count: number,
    sortField: string,
    ascending: boolean
  ): void {
    this.logger.debug(
      'getting page for collection: type=',
      collectionType,
      'name:',
      name,
      'page:',
      page,
      'sortField:',
      sortField,
      'ascending:',
      ascending
    );
    this.store.dispatch(
      new CollectionGetComics({
        collectionType: collectionType,
        name: name,
        page: page,
        count: count,
        sortField: sortField,
        ascending: ascending
      })
    );
  }

  get fetchingEntry$(): Observable<boolean> {
    return this._fetchingEntry$.asObservable();
  }

  get comics$(): Observable<Comic[]> {
    return this._comics$.asObservable();
  }

  get comicCount$(): Observable<number> {
    return this._comicCount$.asObservable();
  }
}
