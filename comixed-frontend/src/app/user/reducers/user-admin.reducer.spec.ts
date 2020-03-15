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

import {
  initialState,
  NEW_USER,
  reducer,
  UserAdminState
} from './user-admin.reducer';
import {
  UserAdminAllReceived,
  UserAdminClearCurrent,
  UserAdminCreateNew,
  UserAdminDeletedUser,
  UserAdminDeleteUser,
  UserAdminDeleteUserFailed,
  UserAdminGetAll,
  UserAdminGetAllFailed,
  UserAdminSave,
  UserAdminSaved,
  UserAdminSaveFailed,
  UserAdminSetCurrent
} from 'app/user/actions/user-admin.actions';
import { USER_ADMIN, USER_READER } from 'app/user';
import { SaveUserDetails } from 'app/user/models/save-user-details';

describe('UserAdmin Reducer', () => {
  const USERS = [USER_READER, USER_ADMIN];
  const USER = USER_READER;

  let state: UserAdminState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching all users flag', () => {
      expect(state.fetchingAll).toBeFalsy();
    });

    it('contains an empty set of users', () => {
      expect(state.users).toEqual([]);
    });

    it('has no current user', () => {
      expect(state.current).toBeNull();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalsy();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalsy();
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalsy();
    });
  });

  describe('when getting all users', () => {
    beforeEach(() => {
      state = reducer({ ...state, fetchingAll: false }, new UserAdminGetAll());
    });

    it('sets the fetching all users flag', () => {
      expect(state.fetchingAll).toBeTruthy();
    });
  });

  describe('when all users have been received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingAll: true, users: [] },
        new UserAdminAllReceived({ users: USERS })
      );
    });

    it('clears the fetching all users flag', () => {
      expect(state.fetchingAll).toBeFalsy();
    });

    it('sets the list of users', () => {
      expect(state.users).toEqual(USERS);
    });
  });

  describe('when getting all users fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingAll: true },
        new UserAdminGetAllFailed()
      );
    });

    it('clears the fetching all users flag', () => {
      expect(state.fetchingAll).toBeFalsy();
    });
  });

  describe('creating a new user', () => {
    beforeEach(() => {
      state = reducer({ ...state, current: null }, new UserAdminCreateNew());
    });

    it('creates an empty user', () => {
      expect(state.current).toEqual(NEW_USER);
    });
  });

  describe('setting the current user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current: null },
        new UserAdminSetCurrent({ user: USER })
      );
    });

    it('sets the current user', () => {
      expect(state.current).toEqual(USER);
    });
  });

  describe('clearing the current user', () => {
    beforeEach(() => {
      state = reducer({ ...state, current: USER }, new UserAdminClearCurrent());
    });

    it('clears the current user', () => {
      expect(state.current).toBeNull();
    });
  });

  describe('when saving a user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false, current: USER, saved: true },
        new UserAdminSave({
          details: {
            id: USER.id,
            email: USER.email,
            password: '1234578',
            isAdmin: true
          } as SaveUserDetails
        })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTruthy();
    });
  });

  describe('when the user has been saved', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          saving: true,
          current: null,
          users: USERS.filter(user => user.id !== USER.id)
        },
        new UserAdminSaved({ user: USER })
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalsy();
    });

    it('sets the saved flag', () => {
      expect(state.saved).toBeTruthy();
    });

    it('updates the current user', () => {
      expect(state.current).toEqual(USER);
    });

    it('merges the user into the list', () => {
      expect(state.users).toContain(USER);
    });
  });

  describe('when saving a user fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: true },
        new UserAdminSaveFailed()
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalsy();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalsy();
    });
  });

  describe('when deleting a user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting: false },
        new UserAdminDeleteUser({ user: USER })
      );
    });

    it('sets the deleting user flag', () => {
      expect(state.deleting).toBeTruthy();
    });
  });

  describe('when a user is deleted', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting: true, users: USERS },
        new UserAdminDeletedUser({ user: USER })
      );
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalsy();
    });

    it('removes the deleted user from the user list', () => {
      expect(state.users).not.toContain(USER);
    });
  });

  describe('when deleting a user fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting: true },
        new UserAdminDeleteUserFailed()
      );
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalsy();
    });
  });
});
