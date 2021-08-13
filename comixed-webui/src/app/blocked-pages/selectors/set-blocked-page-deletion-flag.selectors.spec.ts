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
  SET_BLOCKED_PAGE_DELETION_FLAGS_FEATURE_KEY,
  SetBlockedPageDeletionFlagsState
} from '../reducers/set-blocked-page-deletion-flag.reducer';
import { selectSetBlockedPageDeletionFlagState } from './set-blocked-page-deletion-flag.selectors';

describe('SetBlockedPageDeletionFlag Selectors', () => {
  let state: SetBlockedPageDeletionFlagsState;

  beforeEach(() => {
    state = { marking: Math.random() > 0.5 };
  });

  it('should select the feature state', () => {
    expect(
      selectSetBlockedPageDeletionFlagState({
        [SET_BLOCKED_PAGE_DELETION_FLAGS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
