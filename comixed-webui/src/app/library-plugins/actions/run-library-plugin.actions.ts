/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';

export const runLibraryPluginOnOneComicBook = createAction(
  '[Run Library Plugin] Load a library plugin against one comic book',
  props<{
    plugin: LibraryPlugin;
    comicBookId: number;
  }>()
);

export const runLibraryPluginOnSelectedComicBooks = createAction(
  '[Run Library Plugin] Load a library plugin against all selected comic book',
  props<{
    plugin: LibraryPlugin;
  }>()
);

export const runLibraryPluginSuccess = createAction(
  '[Run Library Plugin] The plugin ran successfully'
);

export const runLibraryPluginFailure = createAction(
  '[Run Library Plugin] The plugin failed to run'
);
