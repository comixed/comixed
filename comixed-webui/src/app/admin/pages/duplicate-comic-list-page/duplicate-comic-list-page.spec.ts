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
import { DuplicateComicListPage } from './duplicate-comic-list-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  DUPLICATE_COMIC_LIST_FEATURE_KEY,
  duplicateComicListAdapter,
  initialDuplicateComicListState
} from '@app/admin/reducers/duplicate-comic-list.reducer';
import { beforeEach, Mock } from 'vitest';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2
} from '@app/admin/admin-fixtures';

describe('DuplicateComicListPage', () => {
  const TEST_DUPLICATE_COMIC_LIST = [DUPLICATE_COMIC_1, DUPLICATE_COMIC_2];
  const initialState = {
    [DUPLICATE_COMIC_LIST_FEATURE_KEY]: duplicateComicListAdapter.setAll(
      TEST_DUPLICATE_COMIC_LIST,
      initialDuplicateComicListState
    )
  };

  let component: DuplicateComicListPage;
  let fixture: ComponentFixture<DuplicateComicListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuplicateComicListPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicateComicListPage);
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
