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
import { UserPreferencesPageComponent } from './user-preferences-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { PREFERENCE_1, USER_READER } from '@app/user/user.fixtures';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { Confirmation } from '@app/core/models/confirmation';

describe('UserPreferencesPageComponent', () => {
  const USER = USER_READER;
  const PREFERENCE = PREFERENCE_1;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: UserPreferencesPageComponent;
  let fixture: ComponentFixture<UserPreferencesPageComponent>;
  let confirmationService: ConfirmationService;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserPreferencesPageComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatTableModule,
        MatSortModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPreferencesPageComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.inject(ConfirmationService);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('deleting a user preference', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeletePreference(PREFERENCE.name);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({ name: PREFERENCE.name, value: null })
      );
    });
  });
});
