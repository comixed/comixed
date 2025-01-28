/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { createAction, props } from '@ngrx/store';
import { Series } from '@app/collections/models/series';
import { Issue } from '@app/collections/models/issue';

export const loadSeriesList = createAction(
  '[Series] Load a series list',
  props<{
    pageIndex: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadSeriesListSuccess = createAction(
  '[Series] A series list was loaded',
  props<{ series: Series[]; totalSeries: number }>()
);

export const loadSeriesListFailure = createAction(
  '[Series] Failed to load a series list'
);

export const loadSeriesDetail = createAction(
  '[Series] Load a single series',
  props<{ publisher: string; name: string; volume: string }>()
);

export const loadSeriesDetailSuccess = createAction(
  '[Series] Returns the details for a series',
  props<{ detail: Issue[] }>()
);

export const loadSeriesDetailFailure = createAction(
  '[Series] Failed to load the details for a series'
);
