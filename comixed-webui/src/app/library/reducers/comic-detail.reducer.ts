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

import { createFeature, createReducer, on } from '@ngrx/store';
import { Comic, NO_COMIC } from '@app/library/models/comic';
import { ComicPage } from '@app/library/models/comic-page';
import { ComicTag } from '@app/library/models/comic-tag';
import { ComicMetadataSource } from '@app/library/models/comic-metadata-source';
import { ComicDetailAction } from '@app/library/actions/comic-detail.actions';

export const COMIC_DETAIL_FEATURE_KEY = 'comic_detail_state';

export interface ComicDetailState {
  busy: boolean;
  comic: Comic;
  pages: ComicPage[];
  tags: ComicTag[];
  metadata: ComicMetadataSource | null;
}

export const initialComicDetailState: ComicDetailState = {
  busy: false,
  comic: NO_COMIC,
  pages: [],
  tags: [],
  metadata: null
};

export const comicDetailReducer = createReducer(
  initialComicDetailState,
  on(ComicDetailAction.load, state => ({
    ...state,
    busy: true,
    comic: NO_COMIC,
    pages: [],
    tags: [],
    metadata: null
  })),
  on(ComicDetailAction.loadSuccess, (state, action) => ({
    ...state,
    busy: false,
    comic: action.comic,
    pages: action.pages,
    tags: action.tags,
    metadata: action.metadata
  })),
  on(ComicDetailAction.loadFailure, state => ({
    ...state,
    busy: false,
    comic: NO_COMIC,
    pages: [],
    tags: [],
    metadata: null
  })),
  on(ComicDetailAction.updateReceived, (state, action) => ({
    ...state,
    comic: action.comic,
    pages: action.pages,
    tags: action.tags,
    metadata: action.metadata
  })),
  on(ComicDetailAction.save, state => ({ ...state, busy: true })),
  on(ComicDetailAction.saveSuccess, state => ({ ...state, busy: false })),
  on(ComicDetailAction.saveFailure, state => ({ ...state, busy: false }))
);

export const comicDetailFeature = createFeature({
  name: COMIC_DETAIL_FEATURE_KEY,
  reducer: comicDetailReducer
});
