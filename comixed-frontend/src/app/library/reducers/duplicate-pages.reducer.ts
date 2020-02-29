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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { DuplicatePage } from 'app/library/models/duplicate-page';
import {
  DuplicatePagesActions,
  DuplicatePagesActionTypes
} from '../actions/duplicate-pages.actions';

export const DUPLICATE_PAGES_FEATURE_KEY = 'duplicate_pages_state';

export interface DuplicatePagesState {
  fetchingAll: boolean;
  pages: DuplicatePage[];
  selected: DuplicatePage[];
  setBlocking: boolean;
  setDeleted: boolean;
}

export const initialState: DuplicatePagesState = {
  fetchingAll: false,
  pages: [],
  selected: [],
  setBlocking: false,
  setDeleted: false
};

export function reducer(
  state = initialState,
  action: DuplicatePagesActions
): DuplicatePagesState {
  switch (action.type) {
    case DuplicatePagesActionTypes.GetAll:
      return { ...state, fetchingAll: true };

    case DuplicatePagesActionTypes.AllReceived:
      return { ...state, fetchingAll: false, pages: action.payload.pages };

    case DuplicatePagesActionTypes.GetAllFailed:
      return { ...state, fetchingAll: false };

    case DuplicatePagesActionTypes.Select: {
      const selected = state.selected
        .concat(action.payload.pages)
        .filter((page, index, array) => array.indexOf(page) === index);

      return { ...state, selected: selected };
    }

    case DuplicatePagesActionTypes.Deselect: {
      const selected = state.selected.filter(
        page => action.payload.pages.indexOf(page) === -1
      );

      return { ...state, selected: selected };
    }

    case DuplicatePagesActionTypes.SetBlocking:
      return { ...state, setBlocking: true };

    case DuplicatePagesActionTypes.BlockingSet:
      return { ...state, setBlocking: false, pages: action.payload.pages };

    case DuplicatePagesActionTypes.SetBlockingFailed:
      return { ...state, setBlocking: false };

    case DuplicatePagesActionTypes.SetDeleted:
      return { ...state, setDeleted: true };

    case DuplicatePagesActionTypes.DeletedSet: {
      const pages = action.payload.pages;
      state.pages.forEach(page => {
        if (!pages.find(entry => entry.hash === page.hash)) {
          pages.push(page);
        }
      });
      return { ...state, setDeleted: false, pages: pages };
    }

    case DuplicatePagesActionTypes.SetDeletedFailed:
      return { ...state, setDeleted: false };

    default:
      return state;
  }
}
