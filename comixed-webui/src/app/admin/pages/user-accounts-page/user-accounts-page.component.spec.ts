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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAccountsPageComponent } from './user-accounts-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  initialState as initialManageUsersState,
  MANAGER_USERS_FEATURE_KEY
} from '@app/user/reducers/manage-users.reducer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { USER_ADMIN, USER_READER } from '@app/user/user.fixtures';
import {
  deleteUserAccount,
  saveUserAccount,
  setCurrentUser
} from '@app/user/actions/manage-users.actions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { isAdmin, passwordVerifyValidator } from '@app/user/user.functions';
import { TitleService } from '@app/core/services/title.service';

describe('UserAccountsPageComponent', () => {
  const USER_LIST = [USER_ADMIN, USER_READER];
  const initialState = {
    [MANAGER_USERS_FEATURE_KEY]: {
      ...initialManageUsersState,
      entries: USER_LIST
    }
  };

  let component: UserAccountsPageComponent;
  let fixture: ComponentFixture<UserAccountsPageComponent>;
  let store: MockStore;
  let confirmationService: ConfirmationService;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAccountsPageComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatIconModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatFormField
      ],
      providers: [
        provideMockStore({ initialState }),
        ConfirmationService,
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccountsPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has a user list', () => {
    expect(component.users).toEqual(USER_LIST);
  });

  describe('creating user', () => {
    beforeEach(() => {
      component.showUserForm = true;
      component.user = null;
    });

    it('stores the user reference', () => {
      expect(component.user).toBeNull();
    });

    it('clears the email address input field', () => {
      expect(component.controls.email.value).toEqual('');
    });

    it('clears the password input field', () => {
      expect(component.controls.password.value).toEqual('');
    });

    it('clears the password validator input field', () => {
      expect(component.controls.passwordVerify.value).toEqual('');
    });

    it('clears the admin check box', () => {
      expect(component.controls.admin.value).toBeFalse();
    });
  });

  describe('editing a reader', () => {
    beforeEach(() => {
      component.showUserForm = true;
      store.setState({
        ...initialState,
        [MANAGER_USERS_FEATURE_KEY]: {
          ...initialManageUsersState,
          current: USER_READER
        }
      });
    });

    it('stores the user reference', () => {
      expect(component.user).toBe(USER_READER);
    });

    it('fills the email address input field', () => {
      expect(component.controls.email.value).toEqual(USER_READER.email);
    });

    it('clears the password input field', () => {
      expect(component.controls.password.value).toEqual('');
    });

    it('clears the password validator input field', () => {
      expect(component.controls.passwordVerify.value).toEqual('');
    });

    it('clears the admin check box', () => {
      expect(component.controls.admin.value).toBeFalse();
    });
  });

  describe('editing an admin', () => {
    beforeEach(() => {
      component.showUserForm = true;
      store.setState({
        ...initialState,
        [MANAGER_USERS_FEATURE_KEY]: {
          ...initialManageUsersState,
          current: USER_ADMIN
        }
      });
    });

    it('stores the user reference', () => {
      expect(component.user).toBe(USER_ADMIN);
    });

    it('fills the email address input field', () => {
      expect(component.controls.email.value).toEqual(USER_ADMIN.email);
    });

    it('clears the password input field', () => {
      expect(component.controls.password.value).toEqual('');
    });

    it('clears the password validator input field', () => {
      expect(component.controls.passwordVerify.value).toEqual('');
    });

    it('sets the admin check box', () => {
      expect(component.controls.admin.value).toBeTrue();
    });
  });

  describe('showing the user form', () => {
    beforeEach(() => {
      component.showUserForm = false;
    });

    describe('for a new user', () => {
      beforeEach(() => {
        component.onShowUserForm(null);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setCurrentUser({ user: null })
        );
      });

      it('shows the form', () => {
        expect(component.showUserForm).toBeTrue();
      });
    });

    describe('for an existing user', () => {
      beforeEach(() => {
        component.onShowUserForm(USER_ADMIN);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setCurrentUser({ user: USER_ADMIN })
        );
      });

      it('shows the form', () => {
        expect(component.showUserForm).toBeTrue();
      });
    });
  });

  describe('saving the account', () => {
    const USER = USER_ADMIN;
    const PASSWORD = 'the!password';

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.user = USER;
      component.controls.password.setValue(PASSWORD);
      component.onSaveAccount();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserAccount({
          id: USER.comixedUserId,
          email: USER.email,
          password: PASSWORD,
          admin: isAdmin(USER)
        })
      );
    });
  });

  describe('deleting the account', () => {
    const USER = USER_ADMIN;
    const PASSWORD = 'the!password';

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.user = USER;
      component.controls.password.setValue(PASSWORD);
      component.onDeleteUser();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteUserAccount({ id: USER.comixedUserId, email: USER.email })
      );
    });
  });

  describe('when a password is entered', () => {
    beforeEach(() => {
      spyOn(component.editUserForm.controls.password, 'setValidators');
      spyOn(component.editUserForm.controls.passwordVerify, 'setValidators');
      spyOn(component.editUserForm, 'setValidators');
      component.editUserForm.controls.password.setValue('1234');
      component.onPasswordChanged();
    });

    it('enables password validation', () => {
      expect(
        component.editUserForm.controls.password.setValidators
      ).toHaveBeenCalled();
    });

    it('enables password verify validation', () => {
      expect(
        component.editUserForm.controls.passwordVerify.setValidators
      ).toHaveBeenCalled();
    });

    it('enables password comparison validation', () => {
      expect(component.editUserForm.setValidators).toHaveBeenCalledWith(
        passwordVerifyValidator
      );
    });
  });

  describe('current language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
