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
import { ComicListViewComponent } from './comic-list-view.component';
import {
  initialState as initialReadingListsState,
  READING_LISTS_FEATURE_KEY
} from '@app/lists/reducers/reading-lists.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

describe('ComicListViewComponent', () => {
  const COMICS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const initialState = {
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState
  };

  let component: ComicListViewComponent;
  let fixture: ComponentFixture<ComicListViewComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatTableModule,
          MatCheckboxModule
        ],
        declarations: [ComicListViewComponent],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicListViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comics', () => {
    beforeEach(() => {
      component.dataSource.data = [{ selected: true, item: COMICS[0] }];
      component.allSelected = true;
      component.comicBooks = COMICS;
    });

    it('updates the list of comics', () => {
      expect(component.dataSource.data.length).toEqual(COMICS.length);
    });

    it('maintains existing selections', () => {
      expect(component.dataSource.data[0].selected).toBeTrue();
    });

    it('updates the all selected flag', () => {
      expect(component.allSelected).toBeFalse();
    });
  });

  describe('sorting data', () => {
    const ENTRY = {
      selected: Math.random() > 0.5,
      item: COMICS[0]
    } as SelectableListItem<ComicDetail>;

    it('can sort by selection state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'selection')
      ).toEqual(`${ENTRY.selected}`);
    });

    it('can sort by selection state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'publisher')
      ).toEqual(ENTRY.item.publisher);
    });

    it('can sort by selection state', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'series')).toEqual(
        ENTRY.item.series
      );
    });

    it('can sort by selection state', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'volume')).toEqual(
        ENTRY.item.volume
      );
    });

    it('can sort by selection state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'issue-number')
      ).toEqual(ENTRY.item.issueNumber);
    });

    it('can sort by selection state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'cover-date')
      ).toEqual(ENTRY.item.coverDate);
    });

    it('can sort by selection state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'added-date')
      ).toEqual(ENTRY.item.addedDate);
    });

    it('can sort by selection state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'archive-type')
      ).toEqual(ENTRY.item.archiveType.toUpperCase());
    });
  });

  describe('selecting entries', () => {
    beforeEach(() => {
      component.comicBooks = COMICS;
    });

    describe('selecting one comic', () => {
      beforeEach(() => {
        component.onSetOneSelectedState(component.dataSource.data[0], true);
      });

      it('selects the entry', () => {
        expect(component.dataSource.data[0].selected).toBeTrue();
      });

      it('does not set the all selected flag', () => {
        expect(component.allSelected).toBeFalse();
      });
    });

    describe('selecting all comics', () => {
      beforeEach(() => {
        component.onSetAllSelectedState(true);
      });

      it('sets the all selected flag', () => {
        expect(component.allSelected).toBeTrue();
      });

      describe('deselecting a comic', () => {
        beforeEach(() => {
          component.onSetOneSelectedState(component.dataSource.data[0], false);
        });

        it('deselects the entry', () => {
          expect(component.dataSource.data[0].selected).toBeFalse();
        });

        it('does not set the all selected flag', () => {
          expect(component.allSelected).toBeFalse();
        });
      });
    });
  });
});
