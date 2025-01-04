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
import { Publisher } from '@app/collections/models/publisher';
import { Series } from '@app/collections/models/series';

export const loadPublisherList = createAction(
  '[Publishers] Load publishers',
  props<{ size: number; page: number; sortBy: string; sortDirection: string }>()
);

export const loadPublisherListSuccess = createAction(
  '[Publishers] Publishers loaded',
  props<{ publishers: Publisher[]; total: number }>()
);

export const loadPublisherListFailure = createAction(
  '[Publishers] Load publishers failed'
);

export const loadPublisherDetail = createAction(
  '[Publishers] Load the details of a publisher',
  props<{
    name: string;
    pageIndex: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadPublisherDetailSuccess = createAction(
  '[Publishers] Publisher detail loaded',
  props<{ totalSeries: number; detail: Series[] }>()
);

export const loadPublisherDetailFailure = createAction(
  '[Publishers] Failed to load the details of a publisher'
);
