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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { LoginComponent } from 'app/ui/components/login/login.component';
import { AppComponent } from 'app/app.component';
import {
  BreadcrumbModule,
  ConfirmDialogModule,
  TieredMenuModule
} from 'primeng/primeng';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor, USER_READER } from 'app/user';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { LibraryModule } from 'app/library/library.module';
import { COMIC_1, COMIC_3, COMIC_5, LibraryAdaptor } from 'app/library';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { MainMenuComponent } from 'app/components/main-menu/main-menu.component';
import {
  AuthLogout,
  AuthNoUserLoaded,
  AuthUserLoaded
} from 'app/user/actions/authentication.actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const USER = USER_READER;

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authenticationAdaptor: AuthenticationAdaptor;
  let libraryAdaptor: LibraryAdaptor;
  let translateService: TranslateService;
  let store: Store<AppState>;

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
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS),
        MenubarModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        BreadcrumbModule,
        TieredMenuModule
      ],
      declarations: [AppComponent, LoginComponent, MainMenuComponent],
      providers: [
        TranslateService,
        MessageService,
        ConfirmationService,
        AuthenticationAdaptor,
        BreadcrumbAdaptor,
        ComicService,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    libraryAdaptor = TestBed.get(LibraryAdaptor);
    translateService = TestBed.get(TranslateService);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

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
});
