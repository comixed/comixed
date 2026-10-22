/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Series } from '@app/library/models/series';

interface SeriesListState {
  series: Series[];
  total: number;
  index: number;
  size: number;
  searchText: string;
  sortBy: string;
  sortDirection: string;
}

const initialState: SeriesListState = {
  series: [],
  total: 0,
  searchText: '',
  index: 0,
  size: 10,
  sortBy: '',
  sortDirection: ''
};

export const SeriesListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    update(series: Series[], total: number): void {
      patchState(store, {
        series,
        total
      });
    }
  }))
);
