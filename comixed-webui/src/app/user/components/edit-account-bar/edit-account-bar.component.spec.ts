/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EditAccountBarComponent } from './edit-account-bar.component';
import { PREFERENCE_1, USER_READER } from '@app/user/user.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { passwordVerifyValidator } from '@app/user/user.functions';
import {
  saveCurrentUser,
  saveUserPreference
} from '@app/user/actions/user.actions';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { LIBRARY_LOAD_MAX_RECORDS } from '@app/comic-books/comic-books.constants';

describe('EditAccountBarComponent', () => {
  const USER = USER_READER;
  const PASSWORD = 'Th1s!i5!mY!P4ssw0rD';
  const PREFERENCE = PREFERENCE_1;
  const initialState = { [USER_FEATURE_KEY]: initialUserState };

  let component: EditAccountBarComponent;
  let fixture: ComponentFixture<EditAccountBarComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EditAccountBarComponent],
        imports: [
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule,
          MatIconModule,
          MatToolbarModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(EditAccountBarComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      translateService = TestBed.inject(TranslateService);
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading the user form', () => {
    beforeEach(() => {
      spyOn(component.userForm.controls.password, 'setValidators');
      spyOn(component.userForm.controls.passwordVerify, 'setValidators');
      spyOn(component.userForm, 'setValidators');
    });

    it('returns the form controls', () => {
      expect(component.controls).not.toBeNull();
    });

    describe('when the user is null', () => {
      beforeEach(() => {
        component.user = null;
      });

      it('clears the user form', () => {
        expect(component.userForm.controls.email.value).toEqual('');
      });
    });

    describe('when the user is not null', () => {
      beforeEach(() => {
        component.user = USER;
      });

      it('loads the user form', () => {
        expect(component.userForm.controls.email.value).toEqual(USER.email);
      });

      it('resets the passwords', () => {
        expect(component.userForm.controls.password.value).toEqual('');
        expect(component.userForm.controls.passwordVerify.value).toEqual('');
      });

      it('clears password validation', () => {
        expect(
          component.userForm.controls.password.setValidators
        ).toHaveBeenCalledWith(null);
      });

      it('clears password verify validation', () => {
        expect(
          component.userForm.controls.passwordVerify.setValidators
        ).toHaveBeenCalledWith(null);
      });

      it('clears password comparison validation', () => {
        expect(component.userForm.setValidators).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('when a password is entered', () => {
    beforeEach(() => {
      spyOn(component.userForm.controls.password, 'setValidators');
      spyOn(component.userForm.controls.passwordVerify, 'setValidators');
      spyOn(component.userForm, 'setValidators');
      component.userForm.controls.password.setValue('1234');
      component.onPasswordChanged();
    });

    it('enables password validation', () => {
      expect(
        component.userForm.controls.password.setValidators
      ).toHaveBeenCalled();
    });

    it('enables password verify validation', () => {
      expect(
        component.userForm.controls.passwordVerify.setValidators
      ).toHaveBeenCalled();
    });

    it('enables password comparison validation', () => {
      expect(component.userForm.setValidators).toHaveBeenCalledWith(
        passwordVerifyValidator
      );
    });
  });

  describe('when a password is entered', () => {
    beforeEach(() => {
      spyOn(component.userForm.controls.password, 'setValidators');
      spyOn(component.userForm.controls.passwordVerify, 'setValidators');
      spyOn(component.userForm, 'setValidators');
      component.userForm.controls.password.setValue('1234');
      component.onPasswordChanged();
    });

    it('enables password validation', () => {
      expect(
        component.userForm.controls.password.setValidators
      ).toHaveBeenCalled();
    });

    it('enables password verify validation', () => {
      expect(
        component.userForm.controls.passwordVerify.setValidators
      ).toHaveBeenCalled();
    });

    it('enables password comparison validation', () => {
      expect(component.userForm.setValidators).toHaveBeenCalledWith(
        passwordVerifyValidator
      );
    });
  });

  describe('comparing entered passwords', () => {
    describe('passwords are the same', () => {
      beforeEach(() => {
        component.userForm.controls.password.setValue(PASSWORD);
        component.userForm.controls.passwordVerify.setValue(PASSWORD);
      });

      it('has no form errors', () => {
        expect(passwordVerifyValidator(component.userForm)).toBeNull();
      });
    });

    describe('passwords are null', () => {
      beforeEach(() => {
        component.userForm.controls.password.setValue(null);
        component.userForm.controls.passwordVerify.setValue(null);
      });

      it('has no form errors', () => {
        expect(passwordVerifyValidator(component.userForm)).toBeNull();
      });
    });

    describe('passwords are different', () => {
      beforeEach(() => {
        component.userForm.controls.password.setValue(PASSWORD);
        component.userForm.controls.passwordVerify.setValue(PASSWORD.substr(1));
      });

      it('sets form errors', () => {
        expect(passwordVerifyValidator(component.userForm)).not.toBeNull();
      });
    });
  });

  describe('saving changes', () => {
    const EMAIL = USER.email.substr(1);

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.user = USER;
      component.userForm.controls.email.setValue(EMAIL);
      component.userForm.controls.password.setValue(PASSWORD);
      component.userForm.controls.passwordVerify.setValue(PASSWORD);
      component.onSaveChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveCurrentUser({ user: { ...USER, email: EMAIL }, password: PASSWORD })
      );
    });
  });

  describe('resetting changes', () => {
    const EMAIL = USER.email.substr(1);

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.user = USER;
      component.userForm.controls.email.setValue(EMAIL);
      component.userForm.controls.password.setValue(PASSWORD);
      component.userForm.controls.passwordVerify.setValue(PASSWORD);
      component.onResetChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('resets the email address', () => {
      expect(component.userForm.controls.email.value).toEqual(USER.email);
    });
  });

  describe('closing the sidebar', () => {
    const EMAIL = USER.email.substr(1);

    beforeEach(() => {
      component.user = USER;
      component.userForm.controls.email.setValue(EMAIL);
      component.userForm.controls.password.setValue(PASSWORD);
      component.userForm.controls.passwordVerify.setValue(PASSWORD);
      spyOn(component.closeSidebar, 'emit');
      component.onCloseForm();
    });

    it('resets the email address', () => {
      expect(component.userForm.controls.email.value).toEqual(USER.email);
    });

    it('emits an event', () => {
      expect(component.closeSidebar.emit).toHaveBeenCalled();
    });
  });

  describe('when the component size changes', () => {
    beforeEach(() => {
      component.avatarWidth$.next(undefined);
      component.onWindowResized({} as any);
    });

    it('sets the avatar width', () => {
      expect(component.avatarWidth$.value).not.toBeNull();
    });
  });

  describe('deleting a user preference', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeletePreference(PREFERENCE.name);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({ name: PREFERENCE.name, value: null })
      );
    });
  });

  describe('sorting', () => {
    it('can sort by preference name', () => {
      expect(
        component.dataSource.sortingDataAccessor(PREFERENCE, 'name')
      ).toEqual(PREFERENCE.name);
    });

    it('can sort by preference value', () => {
      expect(
        component.dataSource.sortingDataAccessor(PREFERENCE, 'value')
      ).toEqual(PREFERENCE.value);
    });
  });

  describe('changing the maximum records to load', () => {
    const MAX_RECORDS = '5000';

    beforeEach(() => {
      component.onSaveMaxRecords(MAX_RECORDS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: LIBRARY_LOAD_MAX_RECORDS,
          value: MAX_RECORDS
        })
      );
    });
  });
});
