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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {LoginComponent} from './login.component';
import {LoggerModule} from '@angular-ru/logger';
import {ReactiveFormsModule} from '@angular/forms';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {TranslateModule} from '@ngx-translate/core';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import {USER_READER} from '@app/user/user.fixtures';
import {loginUser} from '@app/user/actions/user.actions';

describe('LoginComponent', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';

  const initialState = {
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ],
      declarations: [LoginComponent],
      providers: [provideMockStore({initialState})]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when initializing', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {initializing: true}
      });
    });

    it('sets the busy flag', () => {
      expect(component.busy).toBeTruthy();
    });
  });

  describe('when authenticating', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {authenticating: true}
      });
    });

    it('sets the busy flag', () => {
      expect(component.busy).toBeTruthy();
    });
  });

  describe('sending the login credentials', () => {
    beforeEach(() => {
      component.loginForm.controls.email.setValue(USER.email);
      component.loginForm.controls.password.setValue(PASSWORD);
      component.onSubmitLogin();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loginUser({email: USER.email, password: PASSWORD })
      );
    });
  });
});
