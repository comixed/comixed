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
import { NavigationBarComponent } from './navigation-bar.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/logger';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { ConfirmationService } from '@app/core';
import { Confirmation } from '@app/core/models/confirmation';
import { logoutUser } from '@app/user/actions/user.actions';

describe('NavigationBarComponent', () => {
  let component: NavigationBarComponent;
  let fixture: ComponentFixture<NavigationBarComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ],
      declarations: [NavigationBarComponent],
      providers: [provideMockStore({})]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationBarComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('on login clicked', () => {
    beforeEach(() => {
      component.onLogin();
    });

    it('sends the browser to the login page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });
  });

  describe('on logout clicked', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.confirm()
      );
      component.onLogout();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(logoutUser());
    });

    it('sends the user to the login page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });
  });
});
