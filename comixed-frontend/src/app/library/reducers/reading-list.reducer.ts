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
import { ReadingList } from 'app/library/models/reading-list/reading-list';

export interface ReadingListState {
  fetching_lists: boolean;
  reading_lists: ReadingList[];
  fetching_list: boolean;
  current_list: ReadingList;
  saving_reading_list: boolean;
  saving_reading_list_failed: boolean;
}

export const initial_state: ReadingListState = {
  fetching_lists: false,
  reading_lists: [],
  fetching_list: false,
  current_list: null,
  saving_reading_list: false,
  saving_reading_list_failed: false
};

export const READING_LIST_FEATURE_KEY = 'readingList';

export function reducer(
  state = initial_state,
  action: ReadingListActions
): ReadingListState {
  switch (action.type) {
    case ReadingListActionTypes.GetAll:
      return { ...state, fetching_lists: true };

    case ReadingListActionTypes.AllReceived:
      return {
        ...state,
        fetching_lists: false,
        reading_lists: action.payload.reading_lists
      };

    case ReadingListActionTypes.GetAllFailed:
      return { ...state, fetching_lists: false };

    case ReadingListActionTypes.Get:
      return { ...state, fetching_list: true };

    case ReadingListActionTypes.Received:
      return {
        ...state,
        fetching_list: false,
        current_list: action.payload.reading_list
      };

    case ReadingListActionTypes.GetFailed:
      return { ...state, fetching_list: false };

    case ReadingListActionTypes.Create:
      return { ...state, current_list: {} as ReadingList };

    case ReadingListActionTypes.Save:
      return { ...state, saving_reading_list: true };

    case ReadingListActionTypes.Saved: {
      const lists = state.reading_lists.filter(
        list => list.id !== action.payload.reading_list.id
      );
      lists.push(action.payload.reading_list);

      return {
        ...state,
        saving_reading_list: false,
        saving_reading_list_failed: false,
        reading_lists: lists,
        current_list: action.payload.reading_list
      };
    }

    case ReadingListActionTypes.SaveFailed:
      return {
        ...state,
        saving_reading_list: false,
        saving_reading_list_failed: true
      };

    default:
      return state;
  }
}
