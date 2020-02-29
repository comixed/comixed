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

import { UserAdminAdaptor } from './user-admin.adaptor';
import { async, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  reducer,
  USER_ADMIN_FEATURE_KEY
} from 'app/user/reducers/user-admin.reducer';
import { UserAdminEffects } from 'app/user/effects/user-admin.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { AppState, User, USER_ADMIN, USER_READER } from 'app/user';
import {
  UserAdminAllReceived,
  UserAdminCreateNew, UserAdminDeleteUser,
  UserAdminGetAll,
  UserAdminSave,
  UserAdminSaved
} from 'app/user/actions/user-admin.actions';
import { SaveUserDetails } from 'app/user/models/save-user-details';

describe('UserAdminAdaptor', () => {
  const USERS = [USER_ADMIN, USER_READER];
  const USER = USER_READER;
  const PASSWORD = '12345678';

  let adaptor: UserAdminAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(USER_ADMIN_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([UserAdminEffects])
      ],
      providers: [UserAdminAdaptor, MessageService]
    });

    adaptor = TestBed.get(UserAdminAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('getting the list of all users', () => {
    beforeEach(() => {
      adaptor.getAllUsers();
    });

    it('can get all users', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new UserAdminGetAll());
    });

    it('provides updates on fetching users', () => {
      adaptor.fetchingUser$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });
  });

  describe('receiving the list of users', () => {
    beforeEach(() => {
      store.dispatch(new UserAdminAllReceived({ users: USERS }));
    });

    it('provides updates when all users are retrieved', () => {
      adaptor.allUser$.subscribe(response => expect(response).toEqual(USERS));
    });

    it('provides updates on fetching users', () => {
      adaptor.fetchingUser$.subscribe(response => expect(response).toBeFalsy());
    });
  });

  describe('creating a new user', () => {
    beforeEach(() => {
      adaptor.createNewUser();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new UserAdminCreateNew());
    });

    it('updates the current user', () => {
      adaptor.current$.subscribe(response =>
        expect(response).toEqual({} as User)
      );
    });
  });

  describe('saving a user', () => {
    const DETAILS: SaveUserDetails = {
      id: USER.id,
      email: USER.email,
      password: PASSWORD,
      isAdmin: true
    };

    beforeEach(() => {
      adaptor.saveUser(DETAILS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new UserAdminSave({ details: DETAILS })
      );
    });

    it('provides updates for saving', () => {
      adaptor.saving$.subscribe(response => expect(response).toBeTruthy());
    });
  });

  describe('when a user has been saved', () => {
    beforeEach(() => {
      store.dispatch(new UserAdminSaved({ user: USER }));
    });

    it('provides an update on the current user', () => {
      adaptor.current$.subscribe(response => expect(response).toEqual(USER));
    });

    it('provides updates on saving', () => {
      adaptor.saving$.subscribe(response => expect(response).toBeFalsy());
    });

    it('provides updates on saved', () => {
      adaptor.saved$.subscribe(response => expect(response).toBeTruthy());
    });
  });

  describe('when setting the current user', () => {
    beforeEach(() => {
      adaptor.setCurrent(USER);
    });

    it('provides updates', () => {
      adaptor.current$.subscribe(result => expect(result).toEqual(USER));
    });

    describe('when clearing the current user', () => {
      beforeEach(() => {
        adaptor.clearCurrent();
      });

      it('provides updates', async(() => {
        adaptor.current$.subscribe(result => expect(result).toBeNull());
      }));
    });
  });

  describe('when deleting a user', () => {
    beforeEach(() => {
      adaptor.deleteUser(USER);
    });

    it('provides updates on deleting', () => {
      adaptor.deleting$.subscribe(response => expect(response).toBeTruthy());
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new UserAdminDeleteUser({user: USER}));
    });
  });
});
