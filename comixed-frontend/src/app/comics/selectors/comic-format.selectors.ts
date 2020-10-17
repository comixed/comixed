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
  COMIC_FORMAT_FEATURE_KEY,
  ComicFormatState
} from 'app/comics/reducers/comic-format.reducer';

/**
 * Select the feature state.
 */
export const selectComicFormatState = createFeatureSelector<ComicFormatState>(
  COMIC_FORMAT_FEATURE_KEY
);

/**
 * Select just the format list.
 */
export const selectComicFormats = createSelector(
  selectComicFormatState,
  state => state.formats
);
