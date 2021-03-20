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

import { createReducer, on } from '@ngrx/store';
import {
  comicListUpdateReceived,
  resetComicList
} from '../actions/comic-list.actions';
import { Comic } from '@app/library';

export const COMIC_LIST_FEATURE_KEY = 'comic_list_state';

export interface ComicListState {
  comics: Comic[];
}

export const initialState: ComicListState = {
  comics: []
};

export const reducer = createReducer(
  initialState,

  on(resetComicList, state => ({ ...state, comics: [] })),
  on(comicListUpdateReceived, (state, action) => {
    const comics = state.comics.filter(comic => comic.id !== action.comic.id);
    comics.push(action.comic);
    return { ...state, comics };
  })
);
