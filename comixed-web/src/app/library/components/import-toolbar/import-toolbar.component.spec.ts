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
import { ImportToolbarComponent } from './import-toolbar.component';
import { LoggerModule } from '@angular-ru/logger';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY,
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ROOT_DIRECTORY } from '@app/library/library.fixtures';
import { loadComicFiles } from '@app/library/actions/comic-import.actions';
import { MatInputModule } from '@angular/material/input';

describe('ImportToolbarComponent', () => {
  const MAXIMUM = 100;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_READER },
  };

  let component: ImportToolbarComponent;
  let fixture: ComponentFixture<ImportToolbarComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportToolbarComponent],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
      ],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportToolbarComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading files', () => {
    beforeEach(() => {
      component.directory = ROOT_DIRECTORY;
      component.maximum = MAXIMUM;
      fixture.detectChanges();
      component.onLoadFiles();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadComicFiles({ directory: ROOT_DIRECTORY, maximum: MAXIMUM })
      );
    });
  });
});
