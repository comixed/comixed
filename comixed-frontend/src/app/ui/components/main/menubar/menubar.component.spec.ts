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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { MenubarComponent } from './menubar.component';
import { MenuItem } from 'primeng/api';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { initial_state } from 'app/reducers/authentication.reducer';
import { USER_ADMIN, USER_READER } from 'app/models/user.fixtures';
import * as AuthActions from 'app/actions/authentication.actions';

describe('MenubarComponent', () => {
  let component: MenubarComponent;
  let fixture: ComponentFixture<MenubarComponent>;
  let auth_adaptor: AuthenticationAdaptor;
  let store: Store<AppState>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        MenubarModule,
        ButtonModule,
        StoreModule.forRoot(REDUCERS)
      ],
      declarations: [MenubarComponent],
      providers: [AuthenticationAdaptor]
    }).compileComponents();

    fixture = TestBed.createComponent(MenubarComponent);
    component = fixture.componentInstance;
    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    auth_adaptor.auth_state = { ...initial_state };
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    router = TestBed.get(Router);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when a reader logs in', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthUserLoaded({ user: USER_READER }));
    });

    it('loads the menu', () => {
      expect(component.menu_items).toBeTruthy();
    });

    it('does not add the admin menu', () => {
      expect(
        component.menu_items.some((item: MenuItem) => {
          return item.label === 'menu.admin.root';
        })
      ).toBeFalsy();
    });
  });

  describe('when an admin logs in', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthUserLoaded({ user: USER_ADMIN }));
    });

    it('loads the menu', () => {
      expect(component.menu_items).toBeTruthy();
    });

    it('adds the admin menu', () => {
      expect(
        component.menu_items.some((item: MenuItem) => {
          return item.label === 'menu.admin.root';
        })
      ).toBeTruthy();
    });
  });

  describe('when the user clicks the login button', () => {
    beforeEach(() => {
      spyOn(auth_adaptor, 'start_login');
      component.do_login();
      fixture.detectChanges();
    });

    it('starts the login process', () => {
      expect(auth_adaptor.start_login).toHaveBeenCalled();
    });
  });

  describe('when the user clicks the logout button', () => {
    beforeEach(() => {
      spyOn(auth_adaptor, 'start_logout');
      spyOn(router, 'navigate');

      component.do_logout();
    });

    it('starts the logout process', () => {
      expect(auth_adaptor.start_logout).toHaveBeenCalled();
    });

    it('redirects the user to the main page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
