/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  COMIC_DETAIL_FEATURE_KEY,
  ComicDetailState
} from '@app/library/reducers/comic-detail.reducer';

const selectComicDetailState = createFeatureSelector<ComicDetailState>(
  COMIC_DETAIL_FEATURE_KEY
);

export const selectComicDetailLoaded = createSelector(
  selectComicDetailState,
  state => state.busy
);

export const selectComicDetail = createSelector(
  selectComicDetailState,
  state => state.comic
);

export const selectComicDetailTags = createSelector(
  selectComicDetailState,
  state => state.tags
);

export const selectComicDetailPages = createSelector(
  selectComicDetailState,
  state => state.pages
);
