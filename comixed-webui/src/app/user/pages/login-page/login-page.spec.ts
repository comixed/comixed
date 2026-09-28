/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { LoginPage } from '@app/user/pages/login-page/login-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach } from 'vitest';
import { login } from '@app/user/actions/authentication.actions';
import {
  AUTHENTICATION_FEATURE_KEY,
  initialAuthenticationState
} from '@app/user/reducers/authentication.reducer';
import { provideRouter, Router } from '@angular/router';
import { USER_READER } from '@app/user/user-fixtures';

describe('LoginPage', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 'th3!p455W0rD';
  const initialState = {
    [AUTHENTICATION_FEATURE_KEY]: initialAuthenticationState
  };

  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let store: MockStore;
  let storeDispatchSpy: unknown;
  let router: Router;
  let navigateSpy: unknown;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService({ fallbackLang: 'en' }),
        provideMockStore({ initialState }),
        provideRouter([{ path: '**', redirectTo: '' }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigateByUrl');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user is already logged in', () => {
    beforeEach(() => {
      store.setState({
        ...initialAuthenticationState,
        [AUTHENTICATION_FEATURE_KEY]: {
          ...initialAuthenticationState,
          busy: false,
          user: TEST_USER
        }
      });
    });

    it('redirects the browser to the home page', () => {
      expect(navigateSpy).toHaveBeenCalledWith('/');
    });
  });

  describe('submitting the form', () => {
    beforeEach(() => {
      component.loginForm.controls['email'].setValue(TEST_EMAIL);
      component.loginForm.controls['password'].setValue(TEST_PASSWORD);
      component.onSubmitForm();
    });

    it('dispatch a login action', () => {
      expect(storeDispatchSpy).toHaveBeenCalledWith(
        login({ email: TEST_EMAIL, password: TEST_PASSWORD })
      );
    });
  });
});
