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
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { Router } from '@angular/router';
import { LAST_READ_1 } from '@app/last-read/last-read.fixtures';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { convertComics } from '@app/library/actions/convert-comics.actions';
import { archiveTypeFromString } from '@app/comic-books/archive-type.functions';
import { READING_LIST_1 } from '@app/lists/lists.fixtures';
import { addComicsToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { setComicBooksRead } from '@app/last-read/actions/set-comics-read.actions';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { of } from 'rxjs';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { ComicType } from '@app/comic-books/models/comic-type';

describe('ComicDetailListViewComponent', () => {
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const IDS = COMIC_DETAILS.map(detail => detail.comicId);
  const EDIT_DETAILS: EditMultipleComics = {
    publisher: 'The Publisher',
    series: 'The Series',
    volume: '1234',
    issueNumber: '777',
    imprint: 'The Imprint',
    comicType: ComicType.TRADEPAPERBACK
  };
  const LAST_READ_DATES = [LAST_READ_1];
  const COMIC = COMIC_DETAILS[0];
  const initialState = {};

  let component: ComicDetailListViewComponent;
  let fixture: ComponentFixture<ComicDetailListViewComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let dialog: MatDialog;

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
        MatTableModule,
        MatDialogModule,
        MatMenuModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatIconModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
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
    confirmationService = TestBed.inject(ConfirmationService);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving selected ids', () => {
    beforeEach(() => {
      component.dataSource.data = COMIC_DETAILS.map(entry => {
        return { item: entry, selected: true };
      });
      component.selectedIds = [COMIC_DETAILS[0].id];
    });

    it('only marks the comics with the selected id', () => {
      expect(
        component.dataSource.data
          .filter(entry => entry.selected)
          .map(entry => entry.item)
      ).toEqual([COMIC_DETAILS[0]]);
    });
  });

  describe('sorting', () => {
    const ENTRY: SelectableListItem<ComicDetail> = {
      item: COMIC_DETAIL_5,
      selected: Math.random() > 0.5,
      sortableExtraField: Math.random()
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

    it('can sort by comic type', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'comic-type')
      ).toEqual(ENTRY.item.comicType);
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
      ).toEqual(ENTRY.item.sortableIssueNumber);
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

    it('can sort by the extra field', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'extra-field')
      ).toEqual(ENTRY.sortableExtraField);
    });

    it('can sort by last read for unread comic', () => {
      component.lastReadDates = [];
      expect(
        component.dataSource.sortingDataAccessor(
          { ...ENTRY, item: LAST_READ_DATES[0].comicDetail },
          'last-read-date'
        )
      ).toBeUndefined();
    });

    it('can sort by last read for read comic', () => {
      component.lastReadDates = LAST_READ_DATES;
      expect(
        component.dataSource.sortingDataAccessor(
          { ...ENTRY, item: LAST_READ_DATES[0].comicDetail },
          'last-read-date'
        )
      ).toEqual(LAST_READ_DATES[0].lastRead);
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
      item: COMIC_DETAILS[0],
      selected: Math.random() > 0.5
    };

    describe('selecting all comics', () => {
      beforeEach(() => {
        component.dataSource.data = COMIC_DETAILS.map(entry => {
          return { item: entry, selected: false };
        });
        component.onSelectAll(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComicBooks({
            ids: component.dataSource.data.map(entry => entry.item.id)
          })
        );
      });
    });

    describe('deselecting all comics', () => {
      beforeEach(() => {
        component.onSelectAll(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComicBooks({
            ids: component.dataSource.data.map(entry => entry.item.id)
          })
        );
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

  describe('displayed columns', () => {
    beforeEach(() => {
      component.showAction = false;
      component.showSelection = false;
      component.showThumbnail = false;
      component.showArchiveType = false;
      component.showComicType = false;
      component.showComicState = false;
      component.showPublisher = false;
      component.showSeries = false;
      component.showVolume = false;
      component.showIssueNumber = false;
      component.showCoverDate = false;
      component.showStoreDate = false;
      component.showLastReadDate = false;
      component.showAddedDate = false;
    });

    it('can show no columns', () => {
      expect(component.displayedColumns).toEqual([]);
    });

    it('can show the action column', () => {
      component.showAction = true;
      expect(component.displayedColumns).toContain('action');
    });

    it('can show the selection column', () => {
      component.showSelection = true;
      expect(component.displayedColumns).toContain('selection');
    });

    it('can show the thumbnail column', () => {
      component.showThumbnail = true;
      expect(component.displayedColumns).toContain('thumbnail');
    });

    it('can show the archive type column', () => {
      component.showArchiveType = true;
      expect(component.displayedColumns).toContain('archive-type');
    });

    it('can show the comic type column', () => {
      component.showComicType = true;
      expect(component.displayedColumns).toContain('comic-type');
    });

    it('can show the comic state column', () => {
      component.showComicState = true;
      expect(component.displayedColumns).toContain('comic-state');
    });

    it('can show the publisher column', () => {
      component.showPublisher = true;
      expect(component.displayedColumns).toContain('publisher');
    });

    it('can show the series column', () => {
      component.showSeries = true;
      expect(component.displayedColumns).toContain('series');
    });

    it('can show the volume column', () => {
      component.showVolume = true;
      expect(component.displayedColumns).toContain('volume');
    });

    it('can show the issue number column', () => {
      component.showIssueNumber = true;
      expect(component.displayedColumns).toContain('issue-number');
    });

    it('can show the cover date column', () => {
      component.showCoverDate = true;
      expect(component.displayedColumns).toContain('cover-date');
    });

    it('can show the store date column', () => {
      component.showStoreDate = true;
      expect(component.displayedColumns).toContain('store-date');
    });

    it('can show the last read date column', () => {
      component.showLastReadDate = true;
      expect(component.displayedColumns).toContain('last-read-date');
    });

    it('can show the added date column', () => {
      component.showAddedDate = true;
      expect(component.displayedColumns).toContain('added-date');
    });
  });

  describe('checking if a comic is read', () => {
    beforeEach(() => {
      component.lastReadDates = LAST_READ_DATES;
    });

    it('returns false for unread comics', () => {
      expect(component.isRead(COMIC_DETAIL_2)).toBeFalse();
    });

    it('returns true for read comics', () => {
      expect(component.isRead(COMIC_DETAIL_1)).toBeTrue();
    });
  });

  describe('showing the context menu', () => {
    const MOUSE_EVENT = new MouseEvent('testing');

    beforeEach(() => {
      spyOn(component.showContextMenu, 'emit');
      component.onContextMenu(MOUSE_EVENT);
    });

    it('emits an event', () => {
      expect(component.showContextMenu.emit).toHaveBeenCalled();
    });
  });

  describe('context menu selections', () => {
    const ARCHIVE_TYPE = 'CB7';
    const READING_LIST = READING_LIST_1;

    beforeEach(() => {
      component.currentComic = COMIC;
      component.dataSource.data = COMIC_DETAILS.map(comic => {
        return {
          item: comic,
          selected: true
        };
      });
    });

    describe('converting one comic', () => {
      beforeEach(() => {
        spyOn(confirmationService, 'confirm').and.callFake(
          (confirmation: Confirmation) => confirmation.confirm()
        );
        component.onConvertOne(ARCHIVE_TYPE);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          convertComics({
            comicBooks: [COMIC],
            archiveType: archiveTypeFromString(ARCHIVE_TYPE),
            renamePages: true,
            deletePages: true
          })
        );
      });
    });

    describe('converting the selected comics', () => {
      beforeEach(() => {
        spyOn(confirmationService, 'confirm').and.callFake(
          (confirmation: Confirmation) => confirmation.confirm()
        );
        component.onConvertSelected(ARCHIVE_TYPE);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          convertComics({
            comicBooks: COMIC_DETAILS,
            archiveType: archiveTypeFromString(ARCHIVE_TYPE),
            renamePages: true,
            deletePages: true
          })
        );
      });
    });

    describe('adding one comic to a reading list', () => {
      beforeEach(() => {
        component.onAddOneToReadingList(READING_LIST);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          addComicsToReadingList({ comicBooks: [COMIC], list: READING_LIST })
        );
      });
    });

    describe('adding the selected comics to a reading list', () => {
      beforeEach(() => {
        component.onAddSelectedToReadingList(READING_LIST);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          addComicsToReadingList({
            comicBooks: COMIC_DETAILS,
            list: READING_LIST
          })
        );
      });
    });

    describe('marking one comic as read', () => {
      beforeEach(() => {
        component.onMarkOneAsRead(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBooksRead({ comicBooks: [COMIC], read: true })
        );
      });
    });

    describe('marking one comic as unread', () => {
      beforeEach(() => {
        component.onMarkOneAsRead(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBooksRead({ comicBooks: [COMIC], read: false })
        );
      });
    });

    describe('marking the selected comics as read', () => {
      beforeEach(() => {
        component.onMarkSelectedAsRead(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBooksRead({ comicBooks: COMIC_DETAILS, read: true })
        );
      });
    });

    describe('marking the selected comics as unread', () => {
      beforeEach(() => {
        component.onMarkSelectedAsRead(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBooksRead({ comicBooks: COMIC_DETAILS, read: false })
        );
      });
    });

    describe('marking one comic as deleted', () => {
      beforeEach(() => {
        component.onMarkOneAsDeleted(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({ comicBooks: [COMIC], deleted: true })
        );
      });
    });

    describe('marking one comic as undeleted', () => {
      beforeEach(() => {
        component.onMarkOneAsDeleted(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({ comicBooks: [COMIC], deleted: false })
        );
      });
    });

    describe('marking the selected comics as deleted', () => {
      beforeEach(() => {
        component.onMarkSelectedAsDeleted(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({ comicBooks: COMIC_DETAILS, deleted: true })
        );
      });
    });

    describe('marking the selected comics as undeleted', () => {
      beforeEach(() => {
        component.onMarkSelectedAsDeleted(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({ comicBooks: COMIC_DETAILS, deleted: false })
        );
      });
    });
  });

  describe('checking if a comic is deleted', () => {
    it('returns true when the state is deleted', () => {
      expect(
        component.isDeleted({ ...COMIC, comicState: ComicBookState.DELETED })
      ).toBeTrue();
    });

    it('returns false when the state is not deleted', () => {
      expect(
        component.isDeleted({ ...COMIC, comicState: ComicBookState.CHANGED })
      ).toBeFalse();
    });
  });

  describe('editing multiple comics', () => {
    describe('changes saved', () => {
      beforeEach(() => {
        spyOn(confirmationService, 'confirm').and.callFake(
          (confirmation: Confirmation) => confirmation.confirm()
        );
        const dialogRef = jasmine.createSpyObj(['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of(EDIT_DETAILS));
        spyOn(dialog, 'open').and.returnValue(dialogRef);
        component.dataSource.data = COMIC_DETAILS.map(detail => {
          return {
            item: detail,
            selected: true
          };
        });
        component.onEditMultipleComics();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action to edit multiple comics', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          editMultipleComics({
            comicBooks: COMIC_DETAILS,
            details: EDIT_DETAILS
          })
        );
      });
    });

    describe('changes discarded', () => {
      beforeEach(() => {
        const dialogRef = jasmine.createSpyObj(['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of(null));
        spyOn(dialog, 'open').and.returnValue(dialogRef);
        component.dataSource.data = COMIC_DETAILS.map(detail => {
          return {
            item: detail,
            selected: true
          };
        });
        component.onEditMultipleComics();
      });

      it('does not fire an action', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('consolidating comics', () => {
    beforeEach(() => {
      spyOn(component.consolidateComics, 'emit');
      component.onConsolidateComics(IDS);
    });

    it('emits the provided ids', () => {
      expect(component.consolidateComics.emit).toHaveBeenCalledWith(IDS);
    });
  });
});
