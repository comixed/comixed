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

import { Comic } from '@app/library/models/comic';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { LoggerService } from '@angular-ru/cdk/logger';
import { inject } from '@angular/core';

interface ComicListState {
  loading: boolean;
  comics: Comic[];
  totalComics: number;
  pageIndex: number;
  pageSize: number;
}

const initialState: ComicListState = {
  loading: false,
  comics: [],
  totalComics: 0,
  pageIndex: 0,
  pageSize: 10
};

export const ComicListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, logger = inject(LoggerService)) => ({
    setLoading(loading: boolean): void {
      logger.trace('Setting comic list loading flag:', loading);
      patchState(store, { loading });
    },
    update(comics: Comic[], totalComics: number): void {
      logger.trace('Updating comic list state');
      patchState(store, { comics, totalComics });
    }
  }))
);
