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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  ComicBookListState,
  reducer as comicListReducer
} from './reducers/comic-book-list.reducer';
import {
  COMIC_BOOK_FEATURE_KEY,
  ComicBookState,
  reducer as comicReducer
} from './reducers/comic-book.reducer';
import {
  MARK_COMICS_DELETED_FEATURE_KEY,
  MarkComicsDeletedState,
  reducer as markComicsDeletedReducer
} from './reducers/mark-comics-deleted.reducer';
import {
  IMPRINT_LIST_FEATURE_KEY,
  ImprintListState,
  reducer as imprintListReducer
} from './reducers/imprint-list.reducer';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  ComicDetailsListState,
  reducer as comicDetailsListReducer
} from '@app/comic-books/reducers/comic-details-list.reducer';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  ComicBookSelectionState,
  reducer as comicBookSelectionReducer
} from '@app/comic-books/reducers/comic-book-selection.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface ComicModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [COMIC_BOOK_LIST_FEATURE_KEY]: ComicBookListState;
  [COMIC_BOOK_FEATURE_KEY]: ComicBookState;
  [IMPRINT_LIST_FEATURE_KEY]: ImprintListState;
  [MARK_COMICS_DELETED_FEATURE_KEY]: MarkComicsDeletedState;
  [COMIC_DETAILS_LIST_FEATURE_KEY]: ComicDetailsListState;
  [COMIC_BOOK_SELECTION_FEATURE_KEY]: ComicBookSelectionState;
}

export type ModuleState = ComicModuleState;

export const reducers: ActionReducerMap<ComicModuleState> = {
  router: routerReducer,
  [COMIC_BOOK_LIST_FEATURE_KEY]: comicListReducer,
  [COMIC_BOOK_FEATURE_KEY]: comicReducer,
  [IMPRINT_LIST_FEATURE_KEY]: imprintListReducer,
  [MARK_COMICS_DELETED_FEATURE_KEY]: markComicsDeletedReducer,
  [COMIC_DETAILS_LIST_FEATURE_KEY]: comicDetailsListReducer,
  [COMIC_BOOK_SELECTION_FEATURE_KEY]: comicBookSelectionReducer
};
