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

import {
  BLOCKED_HASHES_FEATURE_KEY,
  BlockedHashesState
} from '../reducers/blocked-hashes.reducer';
import {
  selectBlockedHashDetail,
  selectBlockedHashesBusy,
  selectBlockedHashesList,
  selectBlockedHashNotFound
} from './blocked-hashes.selectors';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_4,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';

describe('BlockedHashes Selectors', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const ENTRY = BLOCKED_HASH_4;

  let state: BlockedHashesState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      entries: ENTRIES,
      notFound: Math.random() > 0.5,
      entry: ENTRY,
      saved: Math.random() > 0.5
    };
  });

  it('selects the busy state', () => {
    expect(
      selectBlockedHashesBusy({
        [BLOCKED_HASHES_FEATURE_KEY]: state
      })
    ).toEqual(state.busy);
  });

  it('selects the list of blocked hashes', () => {
    expect(
      selectBlockedHashesList({
        [BLOCKED_HASHES_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });

  it('selects the blocked hash detail', () => {
    expect(
      selectBlockedHashDetail({
        [BLOCKED_HASHES_FEATURE_KEY]: state
      })
    ).toEqual(state.entry);
  });

  describe('checking if the blocked has is valid', () => {
    it('selects when not yet checked', () => {
      expect(
        selectBlockedHashNotFound({
          [BLOCKED_HASHES_FEATURE_KEY]: {
            ...state,
            busy: false,
            notFound: false
          }
        })
      ).toEqual(false);
    });

    it('selects when checking', () => {
      expect(
        selectBlockedHashNotFound({
          [BLOCKED_HASHES_FEATURE_KEY]: {
            ...state,
            busy: true,
            notFound: false
          }
        })
      ).toEqual(false);
    });

    it('selects when not yet checked', () => {
      expect(
        selectBlockedHashNotFound({
          [BLOCKED_HASHES_FEATURE_KEY]: {
            ...state,
            busy: false,
            notFound: true
          }
        })
      ).toEqual(true);
    });
  });
});
