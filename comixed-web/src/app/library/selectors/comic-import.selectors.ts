/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  COMIC_IMPORT_FEATURE_KEY,
  ComicImportState
} from '../reducers/comic-import.reducer';

/** Selects the comic import feature state. */
export const selectComicImportState = createFeatureSelector<ComicImportState>(
  COMIC_IMPORT_FEATURE_KEY
);

/** Selects the loaded comic files. */
export const selectComicFiles = createSelector(
  selectComicImportState,
  state => state.files
);

/** Selects the selected comic files. */
export const selectComicFileSelections = createSelector(
  selectComicImportState,
  state => state.selections
);
