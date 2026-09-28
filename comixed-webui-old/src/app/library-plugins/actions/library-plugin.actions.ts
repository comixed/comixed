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

export const loadLibraryPlugins = createAction(
  '[Library Plugin] Load the list of library plugins'
);

export const loadLibraryPluginsSuccess = createAction(
  '[Library Plugin] Library plugin list loaded',
  props<{ plugins: LibraryPlugin[] }>()
);

export const loadLibraryPluginsFailure = createAction(
  '[Library Plugin] Failed to load the plugin list'
);

export const setCurrentLibraryPlugin = createAction(
  '[Library Plugin] Set the current plugin',
  props<{ plugin: LibraryPlugin }>()
);

export const clearCurrentLibraryPlugin = createAction(
  '[Library Plugin] Clears the current plugin'
);

export const createLibraryPlugin = createAction(
  '[Library Plugin] Create a new plugin',
  props<{ language: string; filename: string }>()
);

export const createLibraryPluginSuccess = createAction(
  '[Library Plugin] Plugin created',
  props<{ plugin: LibraryPlugin }>()
);

export const createLibraryPluginFailure = createAction(
  '[Library Plugin] Failed to create a new plugin'
);

export const updateLibraryPlugin = createAction(
  '[Library Plugin] Update a plugin',
  props<{ plugin: LibraryPlugin }>()
);

export const updateLibraryPluginSuccess = createAction(
  '[Library Plugin] Plugin updated',
  props<{ plugin: LibraryPlugin }>()
);

export const updateLibraryPluginFailure = createAction(
  '[Library Plugin] Failed to update a new plugin'
);

export const deleteLibraryPlugin = createAction(
  '[Library Plugin] Delete a  plugin',
  props<{ plugin: LibraryPlugin }>()
);

export const deleteLibraryPluginSuccess = createAction(
  '[Library Plugin] Plugin deleted'
);

export const deleteLibraryPluginFailure = createAction(
  '[Library Plugin] Failed to delete a new plugin'
);
