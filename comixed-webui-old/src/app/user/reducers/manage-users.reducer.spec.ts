/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  initialState,
  ManagerUsersState,
  reducer
} from './manage-users.reducer';
import { USER_ADMIN, USER_BLOCKED, USER_READER } from '@app/user/user.fixtures';
import {
  deleteUserAccount,
  deleteUserAccountFailure,
  deleteUserAccountSuccess,
  loadUserAccountList,
  loadUserAccountListFailure,
  loadUserAccountListSuccess,
  saveUserAccount,
  saveUserAccountFailure,
  saveUserAccountSuccess,
  setCurrentUser
} from '@app/user/actions/manage-users.actions';

describe('ManageUsers Reducer', () => {
  const USERS = [USER_ADMIN, USER_BLOCKED, USER_READER];
  const USER = USER_READER;

  let state: ManagerUsersState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });

    it('contains no users', () => {
      expect(state.entries).toEqual([]);
    });

    it('contains no current user', () => {
      expect(state.current).toBeNull();
    });
  });

  describe('loading the list of users', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadUserAccountList());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          loadUserAccountListSuccess({ users: USERS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the list of users', () => {
        expect(state.entries).toEqual(USERS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          loadUserAccountListFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('the current user', () => {
    describe('setting the value', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, current: null },
          setCurrentUser({ user: USER })
        );
      });

      it('sets the current user', () => {
        expect(state.current).toBe(USER);
      });
    });

    describe('clearing the value', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, current: USER },
          setCurrentUser({ user: null })
        );
      });

      it('sets the current user', () => {
        expect(state.current).toBeNull();
      });
    });
  });

  describe('creating a new user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, saved: true },
        saveUserAccount({
          id: null,
          email: USER.email,
          password: 'password',
          admin: false
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, saved: false, entries: [] },
          saveUserAccountSuccess({ users: USERS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the saved flag', () => {
        expect(state.saved).toBeTrue();
      });

      it('sets the list of users', () => {
        expect(state.entries).toEqual(USERS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, saveUserAccountFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('deleting a user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        deleteUserAccount({ id: USER.comixedUserId, email: USER.email })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          deleteUserAccountSuccess({ users: USERS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the list of users', () => {
        expect(state.entries).toEqual(USERS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          deleteUserAccountFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
