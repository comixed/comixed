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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { USER_ADMIN } from 'app/user';
import { SaveUserDetails } from 'app/user/models/save-user-details';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { UserDetailsEditorComponent } from './user-details-editor.component';

describe('UserDetailsEditorComponent', () => {
  const USER = USER_ADMIN;
  const PASSWORD = 'this!is!a!password';

  let component: UserDetailsEditorComponent;
  let fixture: ComponentFixture<UserDetailsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        TranslateModule.forRoot(),
        ButtonModule,
        InputSwitchModule
      ],
      declarations: [UserDetailsEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the user', () => {
    beforeEach(() => {
      component.userForm.controls['email'].setValue('');
      component.user = USER;
    });

    it('loads the email field', () => {
      expect(component.userForm.controls['email'].value).toEqual(USER.email);
    });

    it('returns the same user', () => {
      expect(component.user).toEqual(USER);
    });
  });

  describe('requiring passwords to be valid', () => {
    beforeEach(() => {
      component.userForm.controls['email'].setValue(USER.email);
      component.userForm.controls['password'].setValue(PASSWORD);
      component.userForm.controls['passwordVerify'].setValue(PASSWORD);
      component.requirePassword = true;
    });

    it('makes the password required', () => {
      component.userForm.controls['password'].setValue('');
      expect(component.userForm.valid).toBeFalsy();
    });

    it('requires the password verification', () => {
      component.userForm.controls['passwordVerify'].setValue('');
      expect(component.userForm.valid).toBeFalsy();
    });
  });

  describe('not requiring passwords to be valid', () => {
    beforeEach(() => {
      component.userForm.controls['email'].setValue(USER.email);
      component.userForm.controls['password'].setValue(PASSWORD);
      component.userForm.controls['passwordVerify'].setValue(PASSWORD);
      component.requirePassword = false;
    });

    it('allows passwords to be blank', () => {
      component.userForm.controls['password'].setValue('');
      component.userForm.controls['passwordVerify'].setValue('');
      expect(component.userForm.valid).toBeTruthy();
    });

    it('still requires the password match', () => {
      component.userForm.controls['passwordVerify'].setValue('');
      expect(component.userForm.valid).toBeFalsy();
    });
  });

  describe('saving changes to the user', () => {
    beforeEach(() => {
      component.user = USER;
      component.userForm.controls['password'].setValue(PASSWORD);
      component.userForm.controls['passwordVerify'].setValue(PASSWORD);
    });

    it('sends a notification', () => {
      component.save.subscribe(result => {
        expect(result).toEqual({
          id: USER.id,
          email: USER.email,
          password: PASSWORD,
          isAdmin: true
        } as SaveUserDetails);
      });

      component.saveUser();
    });
  });

  describe('resetting the form', () => {
    beforeEach(() => {
      component.user = USER;
      component.userForm.controls['email'].setValue(USER.email.substr(1));
      component.userForm.controls['email'].markAsDirty();
    });

    it('can restore original values', () => {
      component.resetUser();
      expect(component.userForm.controls['email'].value).toEqual(USER.email);
    });

    it('marks the form as pristine', () => {
      component.resetUser();
      expect(component.userForm.dirty).toBeFalsy();
    });
  });

  describe('setting the admin flag', () => {
    beforeEach(() => {
      component.isAdmin = true;
    });

    it('updates the state', () => {
      expect(component.isAdmin).toBeTruthy();
    });
  });

  describe('setting the admin toggle switch', () => {
    it('can be turned on', () => {
      component.userForm.controls['isAdmin'].setValue(true);
      expect(component.adminIsSet()).toBeTruthy();
    });

    it('can be turned off', () => {
      component.userForm.controls['isAdmin'].setValue(false);
      expect(component.adminIsSet()).toBeFalsy();
    });
  });
});
