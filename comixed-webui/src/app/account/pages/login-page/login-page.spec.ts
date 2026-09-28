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
import { LoginPage } from '@app/account/pages/login-page/login-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { AccountService } from '@app/account/services/account-service';
import { provideMockStore } from '@ngrx/store/testing';
import {
  CURRENT_USER_FEATURE_KEY,
  initialCurrentUserState
} from '@app/account/reducers/current-user.reducer';
import { CurrentUserActions } from '@app/account/actions/current-user.actions';

describe('LoginPage', () => {
  const TEST_TITLE_TRANSLATED = 'The Translated Title';
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';
  const initialState = { [CURRENT_USER_FEATURE_KEY]: initialCurrentUserState };

  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService({ fallbackLang: 'en' }),
        provideRouter([{ path: '**', redirectTo: '' }]),
        provideMockStore({ initialState }),
        {
          provide: AccountService,
          useValue: {
            login: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submitting the form', () => {
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(component.store, 'dispatch');
      component.loginForm.controls['email'].setValue(TEST_EMAIL);
      component.loginForm.controls['password'].setValue(TEST_PASSWORD);
      component.onSubmitForm();
    });

    it('performs a login', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        CurrentUserActions.login({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      );
    });
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;
    let instantSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      instantSpy = vi
        .spyOn(component.translateService, 'instant')
        .mockReturnValue(TEST_TITLE_TRANSLATED);
      component.translateService.use('fr');
    });

    it('translates the title', () => {
      expect(instantSpy).toHaveBeenCalled();
    });

    it('updates the title', () => {
      expect(setTitleSpy).toHaveBeenCalledWith(TEST_TITLE_TRANSLATED);
    });
  });
});
