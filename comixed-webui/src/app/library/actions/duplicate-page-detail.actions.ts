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

export const loadDuplicatePageDetail = createAction(
  '[Duplicate Page Detail] Load detail for one page',
  props<{ hash: string }>()
);

export const duplicatePageDetailLoaded = createAction(
  '[Duplicate Page Detail] Duplicate page detail loaded',
  props<{ detail: DuplicatePage }>()
);

export const loadDuplicatePageDetailFailed = createAction(
  '[Duplicate Page Detail] Failed to load detail for one page'
);
