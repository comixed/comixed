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
import { FormBuilder, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { LoginComponent } from './login.component';
import { AuthenticationAdaptor } from 'app/user';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

describe('LoginComponent', () => {
  const EMAIL = 'comixedadmin@localhost';
  const PASSWORD = 'abc!123';

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let auth_adaptor: AuthenticationAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        DialogModule,
        ButtonModule
      ],
      declarations: [LoginComponent],
      providers: [FormBuilder, AuthenticationAdaptor]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    auth_adaptor = TestBed.get(AuthenticationAdaptor);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('user submits the login form using the auth adaptor', () => {
    spyOn(auth_adaptor, 'sendLoginData');
    component.email = EMAIL;
    component.password = PASSWORD;
    component.do_login();
    expect(auth_adaptor.sendLoginData).toHaveBeenCalledWith(EMAIL, PASSWORD);
  });
});
