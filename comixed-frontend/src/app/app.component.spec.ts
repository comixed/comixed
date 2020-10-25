/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import { AppComponent } from 'app/app.component';
import { LoginComponent } from 'app/components/login/login.component';
import { LibraryAdaptor } from 'app/library';
import { LibraryModule } from 'app/library/library.module';
import { UserService } from 'app/services/user.service';
import { AuthenticationAdaptor, USER_READER } from 'app/user';
import {
  AuthLogout,
  AuthNoUserLoaded,
  AuthUserLoaded
} from 'app/user/actions/authentication.actions';
import { UserModule } from 'app/user/user.module';
import { LoggerModule } from '@angular-ru/logger';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import {
  BreadcrumbModule,
  ConfirmDialogModule,
  MenuModule,
  ToolbarModule
} from 'primeng/primeng';
import { ToastModule } from 'primeng/toast';
import { NavigationBarComponent } from 'app/components/navigation-bar/navigation-bar.component';
import * as fromBreadcrumb from 'app/reducers/breadcrumb.reducer';
import {
  BREADCRUMB_FEATURE_KEY,
  BreadcrumbState
} from 'app/reducers/breadcrumb.reducer';
import { MockStore } from '@ngrx/store/testing';

describe('AppComponent', () => {
  const USER = USER_READER;

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authenticationAdaptor: AuthenticationAdaptor;
  let libraryAdaptor: LibraryAdaptor;
  let translateService: TranslateService;
  let store: MockStore<BreadcrumbState>;
  let originalTimeout;

  beforeAll(async done => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;
    done();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        UserModule,
        LibraryModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(BREADCRUMB_FEATURE_KEY, fromBreadcrumb.reducer),
        EffectsModule.forRoot([]),
        MenubarModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        BreadcrumbModule,
        MenuModule,
        ToolbarModule
      ],
      declarations: [AppComponent, LoginComponent, NavigationBarComponent],
      providers: [
        TranslateService,
        MessageService,
        ConfirmationService,
        AuthenticationAdaptor,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    libraryAdaptor = TestBed.get(LibraryAdaptor);
    translateService = TestBed.get(TranslateService);
    store = TestBed.get(Store);

    fixture.detectChanges();
  }));

  describe('on startup', () => {
    it('loads english as the default language', () => {
      expect(translateService.getDefaultLang()).toBe('en');
    });
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      store.dispatch(new AuthUserLoaded({ user: USER }));
      fixture.detectChanges();
      spyOn(libraryAdaptor, 'resetLibrary');
      store.dispatch(new AuthLogout());
      fixture.detectChanges();
      spyOn(libraryAdaptor, 'getLibraryUpdates');
    });

    it('does not fetch updates', () => {
      expect(libraryAdaptor.getLibraryUpdates).not.toHaveBeenCalled();
    });

    it('resets the library', () => {
      expect(libraryAdaptor.resetLibrary).toHaveBeenCalled();
    });

    it('clears the subscription', () => {
      expect(component.fetchingUpdateSubscription).toBeNull();
    });
  });

  describe('when a user is logged in', () => {
    beforeEach(() => {
      store.dispatch(new AuthNoUserLoaded());
      fixture.detectChanges();
      spyOn(libraryAdaptor, 'getLibraryUpdates');
      store.dispatch(new AuthUserLoaded({ user: USER }));
    });

    it('fetches updates when not currently fetching', () => {
      expect(libraryAdaptor.getLibraryUpdates).toHaveBeenCalled();
    });
  });

  afterAll(async done => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    done();
  });
});
