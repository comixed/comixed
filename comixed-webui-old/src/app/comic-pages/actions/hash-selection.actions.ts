/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

export const loadHashSelections = createAction(
  '[Hash Selections] Loads the current selection list'
);

export const loadHashSelectionsSuccess = createAction(
  '[Hash Selections] The current selection list was loaded',
  props<{ entries: string[] }>()
);

export const loadHashSelectionsFailure = createAction(
  '[Hash Selections] Failed to load the current selection list'
);

export const addAllHashesToSelection = createAction(
  '[Hash Selections] Selects all hashes'
);

export const addHashSelection = createAction(
  '[Hash Selections] Selects a single hash',
  props<{ hash: string }>()
);

export const removeHashSelection = createAction(
  '[Hash Selections] Removes a single hash',
  props<{ hash: string }>()
);

export const clearHashSelections = createAction(
  '[Hash Selections] Clear the hash selection list'
);
