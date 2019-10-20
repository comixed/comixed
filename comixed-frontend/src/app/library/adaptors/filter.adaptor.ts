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
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
import {
  FILTERS_FEATURE_KEY,
  FilterState
} from 'app/library/reducers/filters.reducer';
import { filter } from 'rxjs/operators';
import {
  FiltersSetEarliestYearPublished,
  FiltersSetLatestYearPublished,
  FiltersSetPublisher,
  FiltersSetSeries,
  FiltersSetVolume
} from 'app/library/actions/filters.actions';
import { LibraryFilterReset } from 'app/actions/library-filter.actions';

@Injectable()
export class FilterAdaptor {
  private _publisher$ = new BehaviorSubject<string>(null);
  private _series$ = new BehaviorSubject<string>(null);
  private _volume$ = new BehaviorSubject<string>(null);
  private _earliestYearPublished$ = new BehaviorSubject<number>(null);
  private _latestYearPublished$ = new BehaviorSubject<number>(null);

  constructor(public store: Store<AppState>) {
    this.store
      .select(FILTERS_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: FilterState) => {
        if (state.publisher !== this._publisher$.getValue()) {
          this._publisher$.next(state.publisher);
        }
        if (state.series !== this._series$.getValue()) {
          this._series$.next(state.series);
        }
        if (state.volume !== this._volume$.getValue()) {
          this._volume$.next(state.volume);
        }
        if (
          state.earliestYearPublished !==
          this._earliestYearPublished$.getValue()
        ) {
          this._earliestYearPublished$.next(state.earliestYearPublished);
        }
        if (
          state.latestYearPublished !== this._latestYearPublished$.getValue()
        ) {
          this._latestYearPublished$.next(state.latestYearPublished);
        }
      });
  }

  setPublisher(name: string): void {
    this.store.dispatch(new FiltersSetPublisher({ name: name }));
  }

  get publisher$(): Observable<string> {
    return this._publisher$.asObservable();
  }

  setSeries(name: string): void {
    this.store.dispatch(new FiltersSetSeries({ name: name }));
  }

  get series$(): Observable<string> {
    return this._series$.asObservable();
  }

  setVolume(name: string): void {
    this.store.dispatch(new FiltersSetVolume({ name: name }));
  }

  get volume$(): Observable<string> {
    return this._volume$.asObservable();
  }

  setEarliestYearPublished(year: number): void {
    this.store.dispatch(new FiltersSetEarliestYearPublished({ year: year }));
  }

  get earliestYearPublished$(): Observable<number> {
    return this._earliestYearPublished$.asObservable();
  }

  setLatestYearPublished(year: number): void {
    this.store.dispatch(new FiltersSetLatestYearPublished({ year: year }));
  }

  get latestYearPublished$(): Observable<number> {
    return this._latestYearPublished$.asObservable();
  }

  clearFilters(): void {
    this.store.dispatch(new LibraryFilterReset());
  }
}
