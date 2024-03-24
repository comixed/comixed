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
import { CreateAdminPageComponent } from './create-admin-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  INITIAL_USER_ACCOUNT_FEATURE_KEY,
  initialState as initialUserAccountState
} from '@app/user/reducers/initial-user-account.reducer';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { TitleService } from '@app/core/services/title.service';
import {
  createAdminAccount,
  loadInitialUserAccount
} from '@app/user/actions/initial-user-account.actions';
import { USER_ADMIN } from '@app/user/user.fixtures';

describe('CreateAdminPageComponent', () => {
  const EMAIL = USER_ADMIN.email;
  const PASSWORD = 'my!password';
  const initialState = {
    [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
      ...initialUserAccountState,
      busy: true
    }
  };

  let component: CreateAdminPageComponent;
  let fixture: ComponentFixture<CreateAdminPageComponent>;
  let store: MockStore;
  let router: Router;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAdminPageComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatFormFieldModule,
        MatCardModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdminPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    confirmationService = TestBed.inject(ConfirmationService);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language used changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('sets the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('before checking', () => {
    describe('when not previously run', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...initialUserAccountState,
            busy: false,
            checked: false,
            hasExisting: true
          }
        });
      });

      it('redirects the user to the root page', () => {
        expect(store.dispatch).toHaveBeenCalledWith(loadInitialUserAccount());
      });
    });

    describe('finding not existing accounts', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...initialUserAccountState,
            busy: false,
            checked: true,
            hasExisting: false
          }
        });
      });

      it('redirects the user to the root page', () => {
        expect(router.navigateByUrl).not.toHaveBeenCalled();
      });
    });

    describe('finding existing accounts', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...initialUserAccountState,
            busy: false,
            checked: true,
            hasExisting: true
          }
        });
      });

      it('redirects the user to the root page', () => {
        expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('creating the initial admin account', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.createAdminForm.controls.email.setValue(EMAIL);
      component.createAdminForm.controls.password.setValue(PASSWORD);
      component.onCreateAccount();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        createAdminAccount({ email: EMAIL, password: PASSWORD })
      );
    });
  });
});
