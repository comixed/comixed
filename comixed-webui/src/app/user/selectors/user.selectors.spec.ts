/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { USER_FEATURE_KEY, UserState } from '../reducers/user.reducer';
import {
  selectUser,
  selectUserAuthenticated,
  selectUserAuthenticating,
  selectUserInitializingProgress,
  selectUserIsAdmin,
  selectUserMatchPublisher,
  selectUserMaximumRecords,
  selectUserPageSize,
  selectUserSaving,
  selectUserSkipCache
} from './user.selectors';
import { USER_ADMIN, USER_READER } from '@app/user/user.fixtures';
import { PREFERENCE_PAGE_SIZE } from '@app/comic-files/comic-file.constants';
import {
  MATCH_PUBLISHER_PREFERENCE,
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';

describe('User Selectors', () => {
  const USER = USER_READER;

  let state: UserState;

  beforeEach(() => {
    state = {
      initializing: Math.random() > 0.5,
      loading: Math.random() > 0.5,
      authenticating: Math.random() > 0.5,
      authenticated: Math.random() > 0.5,
      user: USER,
      saving: Math.random() > 0.5
    };
  });

  describe('checking if the user is saving', () => {
    it('returns false when not saving', () => {
      expect(
        selectUserSaving({
          [USER_FEATURE_KEY]: { ...state, saving: false }
        })
      ).toBeFalse();
    });

    it('returns true when saving', () => {
      expect(
        selectUserSaving({
          [USER_FEATURE_KEY]: { ...state, saving: true }
        })
      ).toBeTrue();
    });
  });

  it('selects the initializing state', () => {
    expect(
      selectUserInitializingProgress({
        [USER_FEATURE_KEY]: state
      })
    ).toEqual({
      initializing: state.initializing,
      authenticated: state.authenticated,
      user: state.user
    });
  });

  describe('checking if the user is authenticated', () => {
    it('returns false when initializing', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: {
            ...state,
            initializing: true,
            authenticating: false,
            loading: false,
            authenticated: false
          }
        })
      ).toBeFalse();
    });

    it('returns false when authenticating', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: {
            ...state,
            initializing: false,
            authenticating: true,
            loading: false,
            authenticated: false
          }
        })
      ).toBeFalse();
    });

    it('returns false when loading', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: {
            ...state,
            initializing: false,
            authenticating: false,
            loading: true,
            authenticated: false
          }
        })
      ).toBeFalse();
    });

    it('returns true when authenticated', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: {
            ...state,
            initializing: false,
            authenticating: false,
            loading: false,
            authenticated: true
          }
        })
      ).toBeTrue();
    });
  });

  describe('checking if the user is authenticating', () => {
    it('returns true when initializing', () => {
      expect(
        selectUserAuthenticating({
          [USER_FEATURE_KEY]: {
            ...state,
            initializing: true
          }
        })
      ).toBeTrue();
    });

    it('returns true when authenticated', () => {
      expect(
        selectUserAuthenticating({
          [USER_FEATURE_KEY]: {
            ...state,
            authenticated: true
          }
        })
      ).toBeTrue();
    });

    it('returns false when already authenticated', () => {
      expect(
        selectUserAuthenticating({
          [USER_FEATURE_KEY]: {
            ...state,
            initializing: false,
            authenticated: false
          }
        })
      ).toBeFalse();
    });
  });

  describe('selecting the current user', () => {
    it('returns the user when present', () => {
      expect(selectUser({ [USER_FEATURE_KEY]: state })).toEqual(USER);
    });

    it('returns null when no user is present the user when present', () => {
      expect(
        selectUser({ [USER_FEATURE_KEY]: { ...state, user: null } })
      ).toBeNull();
    });
  });

  it('select true if user is an admin', () => {
    expect(
      selectUserIsAdmin({ [USER_FEATURE_KEY]: { ...state, user: USER_ADMIN } })
    ).toEqual(true);
  });

  it('selects false is the user is not an admin', () => {
    expect(
      selectUserIsAdmin({ [USER_FEATURE_KEY]: { ...state, user: USER_READER } })
    ).toEqual(false);
  });

  it('selects the preferred page size', () => {
    const PAGE_SIZE = Math.abs(Math.ceil(Math.random() * 100));
    expect(
      selectUserPageSize({
        [USER_FEATURE_KEY]: {
          ...state,
          user: {
            ...USER_READER,
            preferences: [{ name: PREFERENCE_PAGE_SIZE, value: `${PAGE_SIZE}` }]
          }
        }
      })
    ).toEqual(PAGE_SIZE);
  });

  it('selects the skip cache preference', () => {
    const SKIP_CACHE = Math.random() > 0.5;

    expect(
      selectUserSkipCache({
        [USER_FEATURE_KEY]: {
          ...state,
          user: {
            ...USER_READER,
            preferences: [
              { name: SKIP_CACHE_PREFERENCE, value: `${SKIP_CACHE}` }
            ]
          }
        }
      })
    ).toEqual(SKIP_CACHE);
  });

  it('selects the matching publisher preference', () => {
    const MATCH_PUBLISHER = Math.random() > 0.5;

    expect(
      selectUserMatchPublisher({
        [USER_FEATURE_KEY]: {
          ...state,
          user: {
            ...USER_READER,
            preferences: [
              { name: MATCH_PUBLISHER_PREFERENCE, value: `${MATCH_PUBLISHER}` }
            ]
          }
        }
      })
    ).toEqual(MATCH_PUBLISHER);
  });

  it('selects the max records preference', () => {
    const MAX_RECORDS = Math.abs(Math.ceil(Math.random() * 100));

    expect(
      selectUserMaximumRecords({
        [USER_FEATURE_KEY]: {
          ...state,
          user: {
            ...USER_READER,
            preferences: [
              {
                name: MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
                value: `${MAX_RECORDS}`
              }
            ]
          }
        }
      })
    ).toEqual(MAX_RECORDS);
  });
});
