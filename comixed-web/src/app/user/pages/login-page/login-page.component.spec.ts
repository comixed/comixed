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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { loginUser } from '@app/user/actions/user.actions';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TitleService } from '@app/core/services/title.service';

describe('LoginPageComponent', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';

  const initialState = {
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when initializing', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: { initializing: true }
      });
    });

    it('sets the busy flag', () => {
      expect(component.busy).toBeTrue();
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when authenticating', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: { authenticating: true }
      });
    });

    it('sets the busy flag', () => {
      expect(component.busy).toBeTrue();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: { ...initialUserState, authenticated: true }
      });
    });

    it('redirects the browser to the root url', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
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
        loginUser({ email: USER.email, password: PASSWORD })
      );
    });
  });
});
