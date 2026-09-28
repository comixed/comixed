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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  EXISTING_ADMIN_ACCOUNT_FEATURE_KEY,
  initialExistingAdminAccountState
} from '@app/account/reducers/existing-admin-account.reducer';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { InitialAccountPage } from '@app/account/pages/initial-account-page/initial-account-page';
import { beforeEach, Mock } from 'vitest';
import { ExistingAdminAccountActions } from '@app/account/actions/existing-admin-account.actions';
import { Confirmation, ConfirmationService } from '@openng/optimus-ui/api';

describe('InitialAccountPage', () => {
  const TEST_EMAIL = 'read@comixedproject.org';
  const TEST_PASSWORD = 'th3!p455w0Rd';
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: initialExistingAdminAccountState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: InitialAccountPage;
  let fixture: ComponentFixture<InitialAccountPage>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialAccountPage],
      providers: [
        provideRouter([{ path: 'accounts/initial', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        ConfirmationService
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(InitialAccountPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  describe('when an admin already exists', () => {
    let navigateSpy: Mock;

    beforeEach(() => {
      navigateSpy = vi.spyOn(component.router, 'navigateByUrl');
      store.setState({
        ...initialState,
        [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
          ...initialExistingAdminAccountState,
          checked: true,
          create: false
        }
      });
    });

    it('should redirect the browser to the root page', () => {
      expect(navigateSpy).toHaveBeenCalledWith('/');
    });
  });

  describe('submitting the form', () => {
    let dispatchSpy: Mock;
    let confirmSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(store, 'dispatch');
      confirmSpy = vi
        .spyOn(component.confirmationService, 'confirm')
        .mockImplementation((confirm: Confirmation) => {
          confirm.accept?.();
          return component.confirmationService;
        });
      component.initialAdminForm.controls['email'].setValue(TEST_EMAIL);
      component.initialAdminForm.controls['password'].setValue(TEST_PASSWORD);
      component.initialAdminForm.controls['verifyPassword'].setValue(
        TEST_PASSWORD
      );
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector(
        '#submit-admin-account-details button'
      );
      button.click();
    });

    it('should confirm with the user', () => {
      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should dispatch an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ExistingAdminAccountActions.create({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      );
    });
  });
});
