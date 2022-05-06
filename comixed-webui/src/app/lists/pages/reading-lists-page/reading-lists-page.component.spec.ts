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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReadingListsPageComponent } from './reading-lists-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  initialState as initialReadingListsState,
  READING_LISTS_FEATURE_KEY
} from '@app/lists/reducers/reading-lists.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';
import {
  initialState as initialUploadReadingListState,
  UPLOAD_READING_LIST_FEATURE_KEY
} from '@app/lists/reducers/upload-reading-list.reducer';
import { MatDialogModule } from '@angular/material/dialog';
import { uploadReadingList } from '@app/lists/actions/upload-reading-list.actions';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { ReadingList } from '@app/lists/models/reading-list';
import { deleteReadingLists } from '@app/lists/actions/reading-lists.actions';
import { TitleService } from '@app/core/services/title.service';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';

describe('ReadingListsPageComponent', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];

  const initialState = {
    [READING_LISTS_FEATURE_KEY]: {
      ...initialReadingListsState,
      lists: READING_LISTS
    },
    [UPLOAD_READING_LIST_FEATURE_KEY]: initialUploadReadingListState
  };

  let component: ReadingListsPageComponent;
  let fixture: ComponentFixture<ReadingListsPageComponent>;
  let confirmationService: ConfirmationService;
  let store: MockStore<any>;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ReadingListsPageComponent],
        imports: [
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatToolbarModule,
          MatPaginatorModule,
          MatIconModule,
          MatTableModule,
          MatTooltipModule,
          MatDialogModule
        ],
        providers: [
          provideMockStore({ initialState }),
          ConfirmationService,
          TitleService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ReadingListsPageComponent);
      component = fixture.componentInstance;
      confirmationService = TestBed.inject(ConfirmationService);
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      translateService = TestBed.inject(TranslateService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('loads the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('sorting reading lists', () => {
    const LIST = {
      item: READING_LISTS[0],
      selected: Math.random() > 0.5
    } as SelectableListItem<ReadingList>;

    it('can sort by selection status', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'selection')
      ).toEqual(`${LIST.selected}`);
    });

    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'list-name')
      ).toEqual(LIST.item.name);
    });

    it('can sort by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'comic-count')
      ).toEqual(LIST.item.comicBooks.length);
    });

    it('can sort by created date', () => {
      expect(
        component.dataSource.sortingDataAccessor(LIST, 'created-on')
      ).toEqual(LIST.item.createdOn);
    });
  });

  describe('showing the upload row', () => {
    beforeEach(() => {
      component.showUploadRow = false;
      component.onShowUploadRow();
    });

    it('sets the show upload row flag', () => {
      expect(component.showUploadRow).toBeTrue();
    });
  });

  describe('uploading a file', () => {
    const FILE = new File([], 'test');

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.showUploadRow = true;
      component.onFileSelected(FILE);
    });

    it('clears the show upload row flag', () => {
      expect(component.showUploadRow).toBeFalse();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        uploadReadingList({ file: FILE })
      );
    });
  });

  describe('loading reading lists', () => {
    beforeEach(() => {
      component.dataSource.data = [{ item: READING_LISTS[0], selected: true }];
      component.readingLists = READING_LISTS;
    });

    it('maintains the previous selections', () => {
      expect(component.dataSource.data[0].selected).toBeTrue();
    });
  });

  describe('selecting all reading lists', () => {
    beforeEach(() => {
      component.allSelected = false;
      component.hasSelections = false;
      component.readingLists = READING_LISTS;
      component.onSelectAll(true);
    });

    it('selects all reading lists', () => {
      expect(
        component.dataSource.data.every(entry => entry.selected)
      ).toBeTrue();
    });

    it('set the all selected flag', () => {
      expect(component.allSelected).toBeTrue();
    });

    it('set the has selections flag', () => {
      expect(component.hasSelections).toBeTrue();
    });
  });

  describe('selecting one reading list', () => {
    let entry: SelectableListItem<ReadingList>;

    beforeEach(() => {
      component.allSelected = false;
      component.hasSelections = false;
      component.readingLists = READING_LISTS;
      entry = component.dataSource.data[0];
      component.onSelectOne(entry, true);
    });

    it('selects the entry', () => {
      expect(entry.selected).toBeTrue();
    });

    it('set the has selections flag', () => {
      expect(component.hasSelections).toBeTrue();
    });
  });

  describe('deleting selected reading lists', () => {
    beforeEach(() => {
      component.readingLists = READING_LISTS;
      component.dataSource.data.forEach(entry => (entry.selected = true));
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeleteReadingLists();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteReadingLists({ lists: READING_LISTS })
      );
    });
  });
});
