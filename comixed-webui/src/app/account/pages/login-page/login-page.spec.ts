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
import { beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { USER_READER } from '@app/account/user-fixtures';
import { AccountService } from '@app/account/services/account-service';

describe('LoginPage', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 'th3!p455W0rD';

  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let accountService: AccountService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService({ fallbackLang: 'en' }),
        provideRouter([{ path: '**', redirectTo: '' }]),
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
    accountService = TestBed.inject(AccountService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submitting the form', () => {
    beforeEach(() => {
      component.loginForm.controls['email'].setValue(TEST_EMAIL);
      component.loginForm.controls['password'].setValue(TEST_PASSWORD);
      component.onSubmitForm();
    });

    it('performs a login', () => {
      expect(accountService.login).toHaveBeenCalledWith({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
    });
  });
});
