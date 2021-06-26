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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AccountEditPageComponent,
  passwordVerifyValidator
} from './account-edit-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { USER_READER } from '@app/user/user.fixtures';
import { saveCurrentUser } from '@app/user/actions/user.actions';
import { Confirmation } from '@app/core/models/confirmation';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserCardComponent } from '@app/user/components/user-card/user-card.component';

describe('AccountEditPageComponent', () => {
  const USER = USER_READER;
  const PASSWORD = 'Th1s!i5!mY!P4ssw0rD';
  const initialState = { [USER_FEATURE_KEY]: initialUserState };

  let component: AccountEditPageComponent;
  let fixture: ComponentFixture<AccountEditPageComponent>;
  let store: MockStore<any>;
  let titleService: TitleService;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountEditPageComponent, UserCardComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatIconModule,
        MatToolbarModule
      ],
      providers: [
        provideMockStore({ initialState }),
        TitleService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountEditPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when the user is received', () => {
    beforeEach(() => {
      spyOn(component.userForm.controls.password, 'setValidators');
      spyOn(component.userForm.controls.passwordVerify, 'setValidators');
      spyOn(component.userForm, 'setValidators');
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
      });
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

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
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
});
