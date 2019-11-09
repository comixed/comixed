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

import { Duplicates } from 'app/models/state/duplicates';
import {
  duplicatesReducer,
  initial_state
} from 'app/reducers/duplicates.reducer';
import * as DupesActions from 'app/actions/duplicate-pages.actions';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2
} from 'app/comics/models/duplicate-page.fixtures';
import { DuplicatePage } from 'app/comics';
import { PAGE_1 } from 'app/comics/models/page.fixtures';

describe('duplicatesReducer', () => {
  let state: Duplicates;

  beforeEach(() => {
    state = initial_state;
  });

  describe('when fetching pages', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesFetchPages()
      );
    });

    it('sets the busy flag to true', () => {
      expect(state.busy).toBeTruthy();
    });

    it('resets the list of pages', () => {
      expect(state.pages).toEqual([]);
    });

    it('resets the deleted pages count', () => {
      expect(state.pages_deleted).toEqual(0);
    });

    it('resets the undeleted pages count', () => {
      expect(state.pages_undeleted).toEqual(0);
    });
  });

  describe('when setting the duplicate pages', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesSetPages({
          duplicate_pages: [DUPLICATE_PAGE_1, DUPLICATE_PAGE_2]
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the pages to those received', () => {
      expect(state.pages).toEqual([DUPLICATE_PAGE_1, DUPLICATE_PAGE_2]);
    });

    it('sets the set of hashes to those received', () => {
      expect(state.hashes).toEqual([DUPLICATE_PAGE_1.hash]);
    });

    it('sets the pages by hash for what was received', () => {
      expect(state.pages_by_hash.size).toEqual(1);
      expect(state.pages_by_hash.get(DUPLICATE_PAGE_1.hash)).toEqual([
        DUPLICATE_PAGE_1,
        DUPLICATE_PAGE_2
      ]);
    });

    it('resets the deleted pages count', () => {
      expect(state.pages_deleted).toEqual(0);
    });

    it('resets the undeleted pages count', () => {
      expect(state.pages_undeleted).toEqual(0);
    });
  });

  describe('when deleting all of the duplicate pages', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesDeleteAll({
          hash: DUPLICATE_PAGE_1.hash
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('resets the deleted page count', () => {
      expect(state.pages_deleted).toEqual(0);
    });

    it('resets the undeleted pages count', () => {
      expect(state.pages_undeleted).toEqual(0);
    });
  });

  describe('when receiving the deleted pages for a hash', () => {
    beforeEach(() => {
      state.pages = [
        { ...DUPLICATE_PAGE_1, deleted: false },
        { ...DUPLICATE_PAGE_2, deleted: false }
      ];
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesDeletedForHash({
          hash: DUPLICATE_PAGE_1.hash,
          count: 17
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the hash', () => {
      expect(state.last_hash).toEqual(DUPLICATE_PAGE_1.hash);
    });

    it('sets the deleted pages count', () => {
      expect(state.pages_deleted).toEqual(17);
    });

    it('resets the undeleted pages count', () => {
      expect(state.pages_undeleted).toEqual(0);
    });

    it('unsets the deleted flag for each affected page', () => {
      state.pages.forEach((page: DuplicatePage) => {
        expect(page.deleted).toBeTruthy();
      });
    });
  });

  describe('when undeleting all pages', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesUndeleteAll({
          hash: DUPLICATE_PAGE_1.hash
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('resets the undeleted pages count', () => {
      expect(state.pages_undeleted).toBe(0);
    });
  });

  describe('when receiving the the undelete pages response', () => {
    beforeEach(() => {
      state.pages = [
        { ...DUPLICATE_PAGE_1, deleted: true },
        { ...DUPLICATE_PAGE_2, deleted: true }
      ];
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesUndeletedForHash({
          hash: DUPLICATE_PAGE_1.hash,
          count: 23
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the last hash', () => {
      expect(state.last_hash).toEqual(DUPLICATE_PAGE_1.hash);
    });

    it('sets the undeleted pages count', () => {
      expect(state.pages_undeleted).toEqual(23);
    });

    it('resets the deleted pages count', () => {
      expect(state.pages_deleted).toEqual(0);
    });

    it('unsets the deleted flag for all affected pages', () => {
      state.pages.forEach((page: DuplicatePage) => {
        expect(page.deleted).toBeFalsy();
      });
    });
  });

  describe('when marking a page hash as blocked', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesBlockHash({
          hash: DUPLICATE_PAGE_1.hash
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when marking a page hash as unblocked', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesUnblockHash({
          hash: DUPLICATE_PAGE_1.hash
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when receiving a blocked page response', () => {
    beforeEach(() => {
      state.pages = [
        { ...DUPLICATE_PAGE_1, blocked: false },
        { ...DUPLICATE_PAGE_2, blocked: false }
      ];
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesBlockedHash({
          hash: DUPLICATE_PAGE_1.hash,
          blocked: true
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the blocked state for the pages', () => {
      state.pages.forEach((page: DuplicatePage) => {
        expect(page.blocked).toBeTruthy();
      });
    });
  });

  describe('when showing pages with a hash', () => {
    beforeEach(() => {
      state.pages_by_hash.set(DUPLICATE_PAGE_1.hash, [
        DUPLICATE_PAGE_1,
        DUPLICATE_PAGE_2
      ]);
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesShowComicsWithHash({
          hash: DUPLICATE_PAGE_1.hash
        })
      );
    });

    it('sets the hash in use', () => {
      expect(state.current_hash).toEqual(DUPLICATE_PAGE_1.hash);
    });

    it('sets the current duplicate pages', () => {
      expect(state.current_duplicates).toEqual([
        DUPLICATE_PAGE_1,
        DUPLICATE_PAGE_2
      ]);
    });
  });

  describe('when showing all duplicate pages', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesShowAllPages()
      );
    });

    it('unsets the current hash', () => {
      expect(state.current_hash).toBeNull();
    });

    it('unsets the current duplicate pages', () => {
      expect(state.current_duplicates).toBeNull();
    });
  });

  describe('when deleting a page', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesDeletePage({ page: PAGE_1 })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when receive the deleted page response', () => {
    beforeEach(() => {
      state.pages = [{ ...DUPLICATE_PAGE_1, deleted: false }];
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesPageDeleted({ page: PAGE_1, count: 1 })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the page deleted count', () => {
      expect(state.pages_deleted).toEqual(1);
    });
  });

  describe('when undeleting a page', () => {
    beforeEach(() => {
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesUndeletePage({ page: PAGE_1 })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when receiving the undelete page response', () => {
    beforeEach(() => {
      state.pages = [{ ...DUPLICATE_PAGE_1, deleted: true }];
      state = duplicatesReducer(
        state,
        new DupesActions.DuplicatePagesPageUndeleted({ page: PAGE_1, count: 7 })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('returns the undeleted page count', () => {
      expect(state.pages_undeleted).toEqual(1);
    });
  });
});
