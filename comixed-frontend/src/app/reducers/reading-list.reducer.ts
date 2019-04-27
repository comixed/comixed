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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ReadingListState } from 'app/models/state/reading-list-state';
import * as ReadingListActions from 'app/actions/reading-list.actions';
import { ReadingList } from 'app/models/reading-list';

export const initial_state: ReadingListState = {
  busy: false,
  reading_lists: [],
  current_list: null
};

export function readingListReducer(
  state: ReadingListState = initial_state,
  action: ReadingListActions.Actions
) {
  switch (action.type) {
    case ReadingListActions.READING_LIST_CREATE:
      return {
        ...state,
        current_list: {
          id: null,
          name: '',
          summary: '',
          owner: null,
          entries: []
        }
      };

    case ReadingListActions.READING_LIST_GET_ALL:
      return {
        ...state,
        busy: true
      };

    case ReadingListActions.READING_LIST_GOT_LIST:
      return {
        ...state,
        busy: false,
        reading_lists: action.payload.reading_lists
      };

    case ReadingListActions.READING_LIST_GET_FAILED:
      return {
        ...state,
        busy: false
      };

    case ReadingListActions.READING_LIST_SET_CURRENT:
      return {
        ...state,
        current_list: action.payload.reading_list
      };

    case ReadingListActions.READING_LIST_SAVE:
      return {
        ...state,
        busy: true
      };

    case ReadingListActions.READING_LIST_SAVED: {
      const reading_lists = state.reading_lists.filter(
        (reading_list: ReadingList) =>
          reading_list.id !== action.payload.reading_list.id
      );
      reading_lists.push(action.payload.reading_list);

      return {
        ...state,
        busy: false,
        reading_lists: reading_lists,
        current_list: action.payload.reading_list
      };
    }

    case ReadingListActions.READING_LIST_SAVE_FAILED:
      return {
        ...state,
        busy: false
      };
    default:
      return state;
  }
}
