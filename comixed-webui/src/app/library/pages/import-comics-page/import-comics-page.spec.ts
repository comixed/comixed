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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialUserState,
  USER_FEATURE_KEY
} from '@app/account/reducers/user.reducer';
import {
  COMIC_FILE_LIST_FEATURE_KEY,
  initialComicFileListState
} from '@app/library/reducers/comic-file-list.reducer';
import { ImportComicsPage } from '@app/library/pages/import-comics-page/import-comics-page';

describe('ImportComicsPage', () => {
  const initialState = {
    [USER_FEATURE_KEY]: initialUserState,
    [COMIC_FILE_LIST_FEATURE_KEY]: initialComicFileListState
  };
  let component: ImportComicsPage;
  let fixture: ComponentFixture<ImportComicsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportComicsPage],
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComicsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
