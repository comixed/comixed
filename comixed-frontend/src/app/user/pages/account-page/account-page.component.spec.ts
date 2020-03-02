/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { UserService } from 'app/services/user.service';
import { AppState, AuthenticationAdaptor, TokenService } from 'app/user';
import { AuthUserLoaded } from 'app/user/actions/authentication.actions';
import { UserAdminAdaptor } from 'app/user/adaptors/user-admin.adaptor';
import { AccountPreferencesComponent } from 'app/user/components/account-preferences/account-preferences.component';
import { UserDetailsEditorComponent } from 'app/user/components/user-details-editor/user-details-editor.component';
import { UserDetailsComponent } from 'app/user/components/user-details/user-details.component';
import { AuthenticationEffects } from 'app/user/effects/authentication.effects';
import { USER_ADMIN, USER_READER } from 'app/user/models/user.fixtures';
import {
  AUTHENTICATION_FEATURE_KEY,
  reducer
} from 'app/user/reducers/authentication.reducer';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import {
  ButtonModule,
  InputSwitchModule,
  PanelModule,
  ToggleButtonModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { AccountPageComponent } from './account-page.component';
import objectContaining = jasmine.objectContaining;

describe('AccountPageComponent', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!a!password';

  let component: AccountPageComponent;
  let fixture: ComponentFixture<AccountPageComponent>;
  let authenticationAdaptor: AuthenticationAdaptor;
  let userAdminAdaptor: UserAdminAdaptor;
  let confirmationService: ConfirmationService;
  let store: Store<AppState>;
  let breadcrumbAdaptor: BreadcrumbAdaptor;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(AUTHENTICATION_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([AuthenticationEffects]),
        TabViewModule,
        TableModule,
        ToggleButtonModule,
        ButtonModule,
        PanelModule,
        InputSwitchModule
      ],
      declarations: [
        AccountPageComponent,
        AccountPreferencesComponent,
        UserDetailsComponent,
        UserDetailsEditorComponent
      ],
      providers: [
        AuthenticationAdaptor,
        UserAdminAdaptor,
        BreadcrumbAdaptor,
        MessageService,
        UserService,
        TokenService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPageComponent);
    component = fixture.componentInstance;
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    userAdminAdaptor = TestBed.get(UserAdminAdaptor);
    confirmationService = TestBed.get(ConfirmationService);
    store = TestBed.get(Store);
    store.dispatch(new AuthUserLoaded({ user: USER }));
    breadcrumbAdaptor = TestBed.get(BreadcrumbAdaptor);
    spyOn(breadcrumbAdaptor, 'loadEntries');
    translateService = TestBed.get(TranslateService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user changes', () => {
    beforeEach(() => {
      store.dispatch(new AuthUserLoaded({ user: USER_ADMIN }));
    });

    it('sets the user field', () => {
      expect(component.user).toEqual(USER_ADMIN);
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the breadcrumb trail', () => {
      expect(breadcrumbAdaptor.loadEntries).toHaveBeenCalled();
    });
  });

  describe('saving the user', () => {
    beforeEach(() => {
      spyOn(userAdminAdaptor, 'saveUser');
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.accept()
      );
      component.saveUser({
        id: USER.id,
        email: USER.email,
        isAdmin: true,
        password: PASSWORD
      });
    });

    it('uses the adaptor', () => {
      expect(userAdminAdaptor.saveUser).toHaveBeenCalledWith(
        objectContaining({
          id: USER.id,
          email: USER.email,
          isAdmin: true,
          password: PASSWORD
        })
      );
    });
  });
});
