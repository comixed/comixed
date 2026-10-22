/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from '@app/app';
import { beforeEach } from 'vitest';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  EXISTING_ADMIN_ACCOUNT_FEATURE_KEY,
  initialExistingAdminAccountState
} from '@app/account/reducers/existing-admin-account.reducer';
import {
  CURRENT_USER_FEATURE_KEY,
  initialCurrentUserState
} from '@app/account/reducers/current-user.reducer';
import { MessageService } from '@openng/optimus-ui/api';

describe('App', () => {
  const initialState = {
    [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: initialExistingAdminAccountState,
    [CURRENT_USER_FEATURE_KEY]: initialCurrentUserState
  };
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: 'accounts/initial', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
