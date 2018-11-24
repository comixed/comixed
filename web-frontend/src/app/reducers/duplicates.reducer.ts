/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Duplicates } from '../models/duplicates';
import * as DuplicatesActions from '../actions/duplicate-pages.actions';
import { DuplicatePage } from '../models/comics/duplicate-page';

const initial_state: Duplicates = {
  busy: false,
  pages: [],
  hashes: [],
  pages_by_hash: new Map<string, Array<DuplicatePage>>(),
  current_duplicate: null,
  last_hash: null,
  pages_deleted: 0,
  pages_undeleted: 0,
};

export function duplicatesReducer(
  state: Duplicates = initial_state,
  action: DuplicatesActions.Actions
) {
  // reset these states
  state.pages_deleted = 0;
  state.pages_undeleted = 0;

  switch (action.type) {
    case DuplicatesActions.DUPLICATE_PAGES_FETCH_PAGES: {
      return {
        ...state,
        busy: true,
        pages: [],
        pages_deleted: 0,
        pages_undeleted: 0,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_SET_PAGES: {
      const hashes = [];
      const pages_by_hash = new Map<string, Array<DuplicatePage>>();

      action.payload.forEach((dupe: DuplicatePage) => {
        if (!hashes.includes(dupe.hash)) {
          hashes.push(dupe.hash);
          pages_by_hash.set(dupe.hash, []);
        }
        pages_by_hash.get(dupe.hash).push(dupe);
      });

      return {
        ...state,
        busy: false,
        pages: action.payload,
        hashes: hashes,
        pages_by_hash: pages_by_hash,
        pages_deleted: 0,
        pages_undeleted: 0,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_DELETE_ALL: {
      return {
        ...state,
        busy: true,
        pages_deleted: 0,
        pages_undeleted: 0,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_DELETED_FOR_HASH: {
      state.pages.forEach((page: DuplicatePage) => {
        if (page.hash === action.payload.hash) {
          page.deleted = true;
        }
      });
      return {
        ...state,
        busy: false,
        last_hash: action.payload.hash,
        pages_deleted: action.payload.count,
        pages_undeleted: 0,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_UNDELETE_ALL: {
      return {
        ...state,
        busy: true,
        pages_undeleted: 0,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_UNDELETED_FOR_HASH: {
      state.pages.forEach((page: DuplicatePage) => {
        if (page.hash === action.payload.hash) {
          page.deleted = false;
        }
      });
      return {
        ...state,
        busy: false,
        last_hash: action.payload.hash,
        pages_undeleted: action.payload.count,
        pages_deleted: 0,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_BLOCK_HASH: {
      return {
        ...state,
        busy: true,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_UNBLOCK_HASH: {
      return {
        ...state,
        busy: true,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_BLOCKED_HASH: {
      state.pages.forEach((page: DuplicatePage) => {
        if (page.hash === action.payload.hash) {
          page.blocked = action.payload.blocked;
        }
      });
      return {
        ...state,
        busy: false,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_SHOW_COMICS_WITH_HASH: {
      return {
        ...state,
        current_duplicates: state.pages_by_hash.get(action.payload),
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_SHOW_ALL_PAGES: {
      return {
        ...state,
        current_duplicates: null,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_DELETE_PAGE: {
      return {
        ...state,
        busy: true,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_PAGE_DELETED: {
      action.payload.deleted = true;

      return {
        ...state,
        pages_deleted: 1,
        busy: false,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_UNDELETE_PAGE: {
      return {
        ...state,
        busy: true,
      };
    }

    case DuplicatesActions.DUPLICATE_PAGES_PAGE_UNDELETED: {
      action.payload.deleted = false;

      return {
        ...state,
        pages_undeleted: 1,
        busy: false,
      };
    }

    default:
      return state;
  }
}
