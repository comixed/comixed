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
import { DuplicateComicPage } from './duplicate-comic-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, Mock } from 'vitest';
import {
  DUPLICATE_COMIC_FEATURE_KEY,
  duplicateComicAdapter,
  initialDuplicateComicState
} from '@app/admin/reducers/duplicate-comic.reducer';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import {
  initialSelectedComicListState,
  SELECTED_COMIC_LIST_FEATURE_KEY
} from '@app/library/reducers/selected-comic-list.reducer';

describe('DuplicateComicPage', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const initialState = {
    [DUPLICATE_COMIC_FEATURE_KEY]: duplicateComicAdapter.setAll(
      TEST_COMIC_LIST,
      initialDuplicateComicState
    ),
    [SELECTED_COMIC_LIST_FEATURE_KEY]: initialSelectedComicListState
  };

  let component: DuplicateComicPage;
  let fixture: ComponentFixture<DuplicateComicPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuplicateComicPage],
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

    fixture = TestBed.createComponent(DuplicateComicPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });
});
