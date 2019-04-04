/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { Action } from '@ngrx/store';
import { LibraryFilter } from 'app/models/actions/library-filter';

export const LIBRARY_FILTER_RESET = '[LIBRARY FILTER] Reset filters';
export class LibraryFilterReset implements Action {
  readonly type = LIBRARY_FILTER_RESET;

  constructor() {}
}

export const LIBRARY_FILTER_SET_FILTERS = '[LIBRARY FILTER] Set the filters';
export class LibraryFilterSetFilters implements Action {
  readonly type = LIBRARY_FILTER_SET_FILTERS;

  constructor(
    public payload: {
      publisher: string;
      series: string;
      volume: string;
      from_year: number;
      to_year: number;
    }
  ) {}
}

export type Actions = LibraryFilterReset | LibraryFilterSetFilters;
