/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { ReadingListsPageComponent } from './reading-lists-page.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  initialState as initialReadingListsState,
  READING_LISTS_FEATURE_KEY
} from '@app/lists/reducers/reading-lists.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';

describe('ReadingListsPageComponent', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];

  const initialState = {
    [READING_LISTS_FEATURE_KEY]: {
      ...initialReadingListsState,
      lists: READING_LISTS
    }
  };

  let component: ReadingListsPageComponent;
  let fixture: ComponentFixture<ReadingListsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReadingListsPageComponent],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatPaginatorModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingListsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting reading lists', () => {
    const LIST = READING_LISTS[0];

    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'list-name')
      ).toEqual(LIST.name);
    });

    it('can sort by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'comic-count')
      ).toEqual(LIST.comics.length);
    });

    it('can sort by created date', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'created-on')
      ).toEqual(LIST.createdOn);
    });
  });
});
