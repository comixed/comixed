/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import {
  ReadingListActions,
  ReadingListActionTypes
} from '../actions/reading-list.actions';
import { ReadingList } from 'app/comics/models/reading-list';
import { NEW_READING_LIST } from 'app/library/library.constants';

export interface ReadingListState {
  current: ReadingList;
  savingList: boolean;
  editingList: boolean;
  addingComics: boolean;
  comicsAdded: boolean;
  showSelectionDialog: boolean;
}

export const initialState: ReadingListState = {
  current: null,
  savingList: false,
  editingList: false,
  addingComics: false,
  comicsAdded: false,
  showSelectionDialog: false
};

export const READING_LIST_FEATURE_KEY = 'reading_list_state';

export function reducer(
  state = initialState,
  action: ReadingListActions
): ReadingListState {
  switch (action.type) {
    case ReadingListActionTypes.Create:
      return {
        ...state,
        current: NEW_READING_LIST,
        editingList: true,
        savingList: false
      };

    case ReadingListActionTypes.Edit:
      return {
        ...state,
        editingList: true,
        current: action.payload.readingList,
        savingList: false
      };

    case ReadingListActionTypes.CancelEdit:
      return { ...state, editingList: false, current: null };

    case ReadingListActionTypes.Save:
      return { ...state, savingList: true };

    case ReadingListActionTypes.Saved:
      return {
        ...state,
        savingList: false,
        editingList: false,
        current: action.payload.readingList
      };

    case ReadingListActionTypes.SaveFailed:
      return {
        ...state,
        savingList: false
      };

    case ReadingListActionTypes.AddComics:
      return { ...state, addingComics: true, comicsAdded: false };

    case ReadingListActionTypes.ComicsAdded:
      return { ...state, addingComics: false, comicsAdded: true };

    case ReadingListActionTypes.AddComicsFailed:
      return { ...state, addingComics: false };

    case ReadingListActionTypes.ToggleSelectDialog:
      return { ...state, showSelectionDialog: action.payload.show };

    default:
      return state;
  }
}
