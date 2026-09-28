/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { DuplicatePage } from '@app/library/models/duplicate-page';

export const resetDuplicatePages = createAction(
  '[Duplicate Page List] Resets the feature state'
);

export const loadDuplicatePageList = createAction(
  '[Duplicate Page List] Load a set of duplicate pages',
  props<{
    size: number;
    page: number;
    sortBy: string;
    sortDirection: string;
  }>()
);

export const loadDuplicatePageListSuccess = createAction(
  '[Duplicate Page List] Duplicate page set loaded',
  props<{ totalPages: number; pages: DuplicatePage[] }>()
);

export const loadDuplicatePageListFailure = createAction(
  '[Duplicate Page List] Failed to load any duplicate pages'
);

export const duplicatePageUpdated = createAction(
  '[Duplicate Page List] A duplicate page update was updated',
  props<{
    page: DuplicatePage;
    total: number;
  }>()
);

export const duplicatePageRemoved = createAction(
  '[Duplicate Page List] A duplicate page update was removed',
  props<{
    page: DuplicatePage;
    total: number;
  }>()
);
