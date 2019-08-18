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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
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
import { MenubarComponent } from 'app/ui/components/main/menubar/menubar.component';
import { LoginComponent } from 'app/ui/components/login/login.component';
import { AppComponent } from 'app/app.component';
import { ConfirmDialogModule } from 'primeng/primeng';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor } from 'app/user';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { LibraryModule } from 'app/library/library.module';
import { COMIC_1, COMIC_3, COMIC_5, LibraryAdaptor } from 'app/library';

describe('AppComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let auth_adaptor: AuthenticationAdaptor;
  let library_adaptor: LibraryAdaptor;
  let translate_service: TranslateService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        LibraryModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MenubarModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS)
      ],
      declarations: [AppComponent, MenubarComponent, LoginComponent],
      providers: [
        TranslateService,
        MessageService,
        ConfirmationService,
        AuthenticationAdaptor,
        ComicService,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    library_adaptor = TestBed.get(LibraryAdaptor);
    translate_service = TestBed.get(TranslateService);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
  }));

  describe('on startup', () => {
    it('loads english as the default language', () => {
      expect(translate_service.getDefaultLang()).toBe('en');
    });
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      auth_adaptor._authenticated$.next(true);
      library_adaptor._comic$.next(COMICS);
      fixture.detectChanges();
      spyOn(library_adaptor, 'get_comic_updates');
      spyOn(library_adaptor, 'reset_library');
      auth_adaptor._authenticated$.next(false);
      fixture.detectChanges();
    });

    it('does not fetch updates', () => {
      expect(library_adaptor.get_comic_updates).not.toHaveBeenCalled();
    });

    it('resets the library', () => {
      expect(library_adaptor.reset_library).toHaveBeenCalled();
    });

    it('clears the subscription', () => {
      expect(component.fetching_update_subscription).toBeNull();
    });
  });

  describe('when a user is logged in', () => {
    beforeEach(() => {
      spyOn(library_adaptor, 'get_comic_updates');
      auth_adaptor._authenticated$.next(true);
      library_adaptor._comic$.next(COMICS);
      library_adaptor._fetching_update$.next(false);
    });

    it('fetches updates when not currently fetching', () => {
      expect(library_adaptor.get_comic_updates).toHaveBeenCalled();
    });
  });
});
