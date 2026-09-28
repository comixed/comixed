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
import { TagListPage } from './tag-list-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialTagListState,
  TAG_LIST_FEATURE_KEY,
  tagListAdapter
} from '@app/library/reducers/tag-list.reducer';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3
} from '@app/library/library-fixtures';
import { beforeEach, Mock } from 'vitest';

describe('TagListPage', () => {
  const TEST_COLLECTION_LIST = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3
  ];
  const TEST_TOTAL = 417;
  const initialState = {
    [TAG_LIST_FEATURE_KEY]: tagListAdapter.setAll(TEST_COLLECTION_LIST, {
      ...initialTagListState,
      total: TEST_TOTAL
    })
  };

  let component: TagListPage;
  let fixture: ComponentFixture<TagListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagListPage],
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

    fixture = TestBed.createComponent(TagListPage);
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
