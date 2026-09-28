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
import { AccountService } from '@app/account/services/account-service';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let accountService: AccountService;
  let loadCurrentUserSpy: unknown;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        AccountService,
        provideTranslateService()
      ]
    }).compileComponents();

    accountService = TestBed.inject(AccountService);
    loadCurrentUserSpy = vi.spyOn(accountService, 'loadCurrentUser');
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load the current user', () => {
    expect(loadCurrentUserSpy).toHaveBeenCalled();
  });
});
