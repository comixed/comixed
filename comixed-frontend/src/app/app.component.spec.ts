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
import * as UserActions from 'app/actions/user.actions';
import { READER_USER } from 'app/models/user/user.fixtures';
import * as LibraryActions from 'app/actions/library.actions';
import {
  COMIC_1000,
  COMIC_1001,
  COMIC_1002
} from 'app/models/comics/comic.fixtures';
import { MenubarComponent } from 'app/ui/components/main/menubar/menubar.component';
import { LoginComponent } from 'app/ui/components/login/login.component';
import { AppComponent } from 'app/app.component';
import { ConfirmDialogModule } from 'primeng/primeng';
import { REDUCERS } from 'app/app.reducers';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translate_service: TranslateService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MenubarModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        ConfirmDialogModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS)
      ],
      declarations: [AppComponent, MenubarComponent, LoginComponent],
      providers: [TranslateService, MessageService, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
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

  describe('#ngOnInit()', () => {
    it('subscribes to user updates', () => {
      store.dispatch(new UserActions.UserLoaded({ user: READER_USER }));
      expect(component.user.email).toEqual(READER_USER.email);
    });

    it('performs a user check', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new UserActions.UserAuthCheck()
      );
    });

    it('subscribes to library updates', () => {
      store.dispatch(
        new LibraryActions.LibraryMergeNewComics({
          library_state: {
            comics: [COMIC_1000, COMIC_1001, COMIC_1002],
            rescan_count: 70,
            import_count: 43
          }
        })
      );
      expect(component.library.comics).toEqual([
        COMIC_1000,
        COMIC_1001,
        COMIC_1002
      ]);
      expect(component.library.library_state.rescan_count).toEqual(70);
      expect(component.library.library_state.import_count).toEqual(43);
    });
  });
});
