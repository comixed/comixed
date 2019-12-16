/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 *t
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainMenuComponent } from './main-menu.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  ButtonModule,
  MessageService,
  TieredMenuModule
} from 'primeng/primeng';
import { UserModule } from 'app/user/user.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppState, USER_READER } from 'app/user';
import {
  AuthLogout,
  AuthUserLoaded
} from 'app/user/actions/authentication.actions';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('MainMenuComponent', () => {
  let component: MainMenuComponent;
  let fixture: ComponentFixture<MainMenuComponent>;
  let translateService: TranslateService;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        TieredMenuModule,
        ButtonModule
      ],
      declarations: [MainMenuComponent],
      providers: [MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(MainMenuComponent);
    component = fixture.componentInstance;
    translateService = TestBed.get(TranslateService);
    store = TestBed.get(Store);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reloads the menu on language change', () => {
    component.items = [];
    translateService.use('fr');
    fixture.detectChanges();
    expect(component.items).not.toEqual([]);
  });

  describe('when the user changes', () => {
    beforeEach(() => {
      component.items = [];
      store.dispatch(new AuthUserLoaded({ user: USER_READER }));
      fixture.detectChanges();
    });

    it('loads the menu when the user logs in', () => {
      expect(component.items).not.toEqual([]);
    });

    it('loads the menu when the user logs out', () => {
      component.items = [];
      store.dispatch(new AuthLogout());
      fixture.detectChanges();
      expect(component.items).not.toEqual([]);
    });
  });
});
