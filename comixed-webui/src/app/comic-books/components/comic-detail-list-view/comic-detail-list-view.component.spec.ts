/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { ComicDetailListViewComponent } from './comic-detail-list-view.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  clearSelectedComicBooks,
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { Router } from '@angular/router';

describe('ComicDetailListViewComponent', () => {
  const COMICS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const COMIC = COMICS[0];
  const initialState = {};

  let component: ComicDetailListViewComponent;
  let fixture: ComponentFixture<ComicDetailListViewComponent>;
  let store: MockStore<any>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ComicDetailListViewComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSortModule,
        MatTableModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailListViewComponent);
    component = fixture.componentInstance;
    component.dataSource = new MatTableDataSource<
      SelectableListItem<ComicDetail>
    >([]);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving selected ids', () => {
    beforeEach(() => {
      component.dataSource.data = COMICS.map(entry => {
        return { item: entry, selected: true };
      });
      component.selectedIds = [COMICS[0].id];
    });

    it('only marks the comics with the selected id', () => {
      expect(
        component.dataSource.data
          .filter(entry => entry.selected)
          .map(entry => entry.item)
      ).toEqual([COMICS[0]]);
    });
  });

  describe('sorting', () => {
    const ENTRY: SelectableListItem<ComicDetail> = {
      item: COMIC_DETAIL_5,
      selected: Math.random() > 0.5
    };

    it('can sort by selection', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'selection')
      ).toEqual(`${ENTRY.selected}`);
    });

    it('can sort by archive type', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'archive-type')
      ).toEqual(ENTRY.item.archiveType);
    });

    it('can sort by comic state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'comic-state')
      ).toEqual(ENTRY.item.comicState);
    });

    it('can sort by publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'publisher')
      ).toEqual(ENTRY.item.publisher);
    });

    it('can sort by series', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'series')).toEqual(
        ENTRY.item.series
      );
    });

    it('can sort by volume', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'volume')).toEqual(
        ENTRY.item.volume
      );
    });

    it('can sort by issue number', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'issue-number')
      ).toEqual(ENTRY.item.issueNumber);
    });

    it('can sort by cover date', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'cover-date')
      ).toEqual(ENTRY.item.coverDate);
    });

    it('can sort by store date', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'store-date')
      ).toEqual(ENTRY.item.addedDate);
    });

    it('returns null on an unknown column', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'storge-date')
      ).toBeNull();
    });
  });

  describe('toggling the selected state', () => {
    const ENTRY: SelectableListItem<ComicDetail> = {
      item: COMIC_DETAIL_5,
      selected: false
    };

    describe('toggling it on', () => {
      beforeEach(() => {
        component.toggleSelected({ ...ENTRY, selected: false });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComicBooks({ ids: [ENTRY.item.id] })
        );
      });
    });

    describe('toggling it off', () => {
      beforeEach(() => {
        component.toggleSelected({ ...ENTRY, selected: true });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComicBooks({ ids: [ENTRY.item.id] })
        );
      });
    });
  });

  describe('getting icons for comic states', () => {
    it('always returns a value', () => {
      for (const state in ComicBookState) {
        expect(
          component.getIconForState(state as ComicBookState)
        ).not.toBeNull();
      }
    });
  });

  describe('selecting comics', () => {
    const ENTRY: SelectableListItem<ComicDetail> = {
      item: COMICS[0],
      selected: Math.random() > 0.5
    };

    describe('selecting all comics', () => {
      beforeEach(() => {
        component.dataSource.filteredData = COMICS.map(entry => {
          return { item: entry, selected: true };
        });
        component.onSelectAll(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComicBooks({ ids: COMICS.map(entry => entry.id) })
        );
      });
    });

    describe('deselecting all comics', () => {
      beforeEach(() => {
        component.onSelectAll(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(clearSelectedComicBooks());
      });
    });

    describe('selecting one comic', () => {
      beforeEach(() => {
        component.onSelectOne(ENTRY, true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComicBooks({ ids: [ENTRY.item.id] })
        );
      });
    });

    describe('deselecting one comic', () => {
      beforeEach(() => {
        component.onSelectOne(ENTRY, false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComicBooks({ ids: [ENTRY.item.id] })
        );
      });
    });
  });

  describe('when a row is selected', () => {
    const ENTRY = {
      item: COMIC_DETAIL_1,
      selected: Math.random() > 0.5
    } as SelectableListItem<ComicDetail>;

    describe('when following a link is disabled', () => {
      beforeEach(() => {
        component.followClick = false;
        component.onRowSelected(ENTRY);
      });

      it('does nothing', () => {
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

    describe('when following a link is enabled', () => {
      beforeEach(() => {
        component.followClick = true;
        component.onRowSelected(ENTRY);
      });

      it('does nothing', () => {
        expect(router.navigate).toHaveBeenCalledWith([
          '/comics',
          ENTRY.item.comicId
        ]);
      });
    });
  });

  describe('the comic cover overlay', () => {
    describe('showing the cover overlay', () => {
      beforeEach(() => {
        component.showPopup = false;
        component.currentComic = null;
        component.onShowPopup(true, COMIC);
      });

      it('sets the show popup flag', () => {
        expect(component.showPopup).toBeTrue();
      });

      it('sets the current comic', () => {
        expect(component.currentComic).toBe(COMIC);
      });

      describe('hiding the cover overlay', () => {
        beforeEach(() => {
          component.onShowPopup(false, null);
        });

        it('hides the show popup flag', () => {
          expect(component.showPopup).toBeFalse();
        });

        it('clears the current comic', () => {
          expect(component.currentComic).toBeNull();
        });
      });
    });
  });
});
