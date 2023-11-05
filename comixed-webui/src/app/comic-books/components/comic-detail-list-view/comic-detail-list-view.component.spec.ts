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
  COMIC_DETAIL_2
} from '@app/comic-books/comic-books.fixtures';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicState } from '@app/comic-books/models/comic-state';
import { Router } from '@angular/router';
import { LAST_READ_1 } from '@app/comic-books/comic-books.fixtures';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  convertSelectedComicBooks,
  convertSingleComicBook
} from '@app/library/actions/convert-comic-books.actions';
import { archiveTypeFromString } from '@app/comic-books/comic-books.functions';
import { READING_LIST_1 } from '@app/lists/lists.fixtures';
import { addSelectedComicBooksToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import {
  markSelectedComicBooksRead,
  markSingleComicBookRead
} from '@app/comic-books/actions/comic-books-read.actions';
import {
  deleteSelectedComicBooks,
  deleteSingleComicBook,
  undeleteSelectedComicBooks,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { BehaviorSubject, of } from 'rxjs';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { ComicType } from '@app/comic-books/models/comic-type';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComicDetailFilterComponent } from '@app/comic-books/components/comic-detail-filter/comic-detail-filter.component';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  updateSelectedComicBooksMetadata,
  updateSingleComicBookMetadata
} from '@app/library/actions/update-metadata.actions';
import { startLibraryConsolidation } from '@app/library/actions/consolidate-library.actions';
import {
  rescanSelectedComicBooks,
  rescanSingleComicBook
} from '@app/library/actions/rescan-comics.actions';
import {
  addSingleComicBookSelection,
  removeSingleComicBookSelection
} from '@app/comic-books/actions/comic-book-selection.actions';

describe('ComicDetailListViewComponent', () => {
  const COMIC_DETAILS = [
    {
      ...COMIC_DETAIL_1,
      coverDate: new Date().getTime(),
      archiveType: ArchiveType.CB7
    },
    { ...COMIC_DETAIL_2, coverDate: null, archiveType: ArchiveType.CBR }
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
  const COMIC_DETAIL = COMIC_DETAILS[0];
  const initialState = {};

  let component: ComicDetailListViewComponent;
  let fixture: ComponentFixture<ComicDetailListViewComponent>;
  let store: MockStore<any>;
  let router: Router;
  let confirmationService: ConfirmationService;
  let dialog: MatDialog;
  let queryParameterService: jasmine.SpyObj<QueryParameterService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ComicDetailListViewComponent,
        ComicDetailFilterComponent,
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
        MatIconModule,
        MatPaginatorModule,
        MatTooltipModule
      ],
      providers: [
        provideMockStore({ initialState }),
        ConfirmationService,
        {
          provide: QueryParameterService,
          useValue: {
            coverYear$: new BehaviorSubject<CoverDateFilter>({
              year: null,
              month: null
            }),
            archiveType$: new BehaviorSubject<ArchiveType>(null),
            comicType$: new BehaviorSubject<ComicType>(null),
            filterText$: new BehaviorSubject<string>(null)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailListViewComponent);
    component = fixture.componentInstance;
    spyOn(component.selectAll, 'emit');
    component.dataSource = new MatTableDataSource<
      SelectableListItem<ComicDetail>
    >([]);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');
    confirmationService = TestBed.inject(ConfirmationService);
    dialog = TestBed.inject(MatDialog);
    queryParameterService = TestBed.inject(
      QueryParameterService
    ) as jasmine.SpyObj<QueryParameterService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving selected ids', () => {
    beforeEach(() => {
      component.comics = COMIC_DETAILS;
      component.dataSource.data.forEach(entry => (entry.selected = true));
      component.selectedIds = [COMIC_DETAILS[0].comicId];
    });

    it('only marks the comics with the selected id', () => {
      expect(
        component.dataSource.data
          .filter(entry => entry.selected)
          .map(entry => entry.item)
      ).toEqual([COMIC_DETAILS[0]]);
    });
  });

  describe('getting icons for comic states', () => {
    it('always returns a value', () => {
      for (const state in ComicState) {
        expect(component.getIconForState(state as ComicState)).not.toBeNull();
      }
    });
  });

  describe('selecting comics', () => {
    const ENTRY: SelectableListItem<ComicDetail> = {
      item: COMIC_DETAILS[0],
      selected: Math.random() > 0.5
    };

    describe('selecting one comic', () => {
      beforeEach(() => {
        component.onSetSelectedState(ENTRY, true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          addSingleComicBookSelection({
            comicBookId: ENTRY.item.comicId
          })
        );
      });
    });

    describe('deselecting one comic', () => {
      beforeEach(() => {
        component.onSetSelectedState(ENTRY, false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          removeSingleComicBookSelection({
            comicBookId: ENTRY.item.comicId
          })
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
        component.showComicDetailPopup = false;
        component.selectedComicDetail = null;
        component.onShowPopup(true, COMIC_DETAIL);
      });

      it('sets the show popup flag', () => {
        expect(component.showComicDetailPopup).toBeTrue();
      });

      it('sets the current comic', () => {
        expect(component.selectedComicDetail).toBe(COMIC_DETAIL);
      });

      describe('hiding the cover overlay', () => {
        beforeEach(() => {
          component.onShowPopup(false, null);
        });

        it('hides the show popup flag', () => {
          expect(component.showComicDetailPopup).toBeFalse();
        });

        it('clears the current comic', () => {
          expect(component.selectedComicDetail).toBeNull();
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

  describe('context menu selections', () => {
    const ARCHIVE_TYPE = 'CB7';
    const READING_LIST = READING_LIST_1;

    beforeEach(() => {
      component.selectedComicDetail = COMIC_DETAIL;
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
        component.onConvertSingleComicBook(ARCHIVE_TYPE);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          convertSingleComicBook({
            comicDetail: COMIC_DETAIL,
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
          convertSelectedComicBooks({
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
          addSelectedComicBooksToReadingList({
            list: READING_LIST
          })
        );
      });
    });

    describe('adding the selected comics to a reading list', () => {
      beforeEach(() => {
        component.onAddSelectedToReadingList(READING_LIST);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          addSelectedComicBooksToReadingList({
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
          markSingleComicBookRead({
            comicBookId: COMIC_DETAIL.comicId,
            read: true
          })
        );
      });
    });

    describe('marking one comic as unread', () => {
      beforeEach(() => {
        component.onMarkOneAsRead(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markSingleComicBookRead({
            comicBookId: COMIC_DETAIL.comicId,
            read: false
          })
        );
      });
    });

    describe('marking the selected comics as read', () => {
      beforeEach(() => {
        component.onMarkSelectedAsRead(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markSelectedComicBooksRead({ read: true })
        );
      });
    });

    describe('marking the selected comics as unread', () => {
      beforeEach(() => {
        component.onMarkSelectedAsRead(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markSelectedComicBooksRead({ read: false })
        );
      });
    });

    describe('marking a single comic book as deleted', () => {
      beforeEach(() => {
        component.selectedComicDetail = COMIC_DETAIL;
        component.onMarkOneAsDeleted(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deleteSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
        );
      });
    });

    describe('marking a single comic book as undeleted', () => {
      beforeEach(() => {
        component.selectedComicDetail = COMIC_DETAIL;
        component.onMarkOneAsDeleted(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          undeleteSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
        );
      });
    });

    describe('marking the selected comics as deleted', () => {
      beforeEach(() => {
        component.onMarkSelectedAsDeleted(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(deleteSelectedComicBooks());
      });
    });

    describe('marking the selected comics as undeleted', () => {
      beforeEach(() => {
        component.onMarkSelectedAsDeleted(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          undeleteSelectedComicBooks()
        );
      });
    });
  });

  describe('checking if a comic is deleted', () => {
    it('returns true when the state is deleted', () => {
      expect(
        component.isDeleted({ ...COMIC_DETAIL, comicState: ComicState.DELETED })
      ).toBeTrue();
    });

    it('returns false when the state is not deleted', () => {
      expect(
        component.isDeleted({ ...COMIC_DETAIL, comicState: ComicState.CHANGED })
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
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onConsolidateSelectedComicBooks();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(startLibraryConsolidation());
    });
  });

  describe('selecting comics', () => {
    const IDS = COMIC_DETAILS.map(entry => entry.comicId);
    const event = new KeyboardEvent('hotkey');

    beforeEach(() => {
      spyOn(event, 'preventDefault');
      component.comics = COMIC_DETAILS;
    });

    describe('selecting all comics', () => {
      beforeEach(() => {
        component.onHotkeySelectAll(event);
      });

      it('stops the event from propagating', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('emits an event', () => {
        expect(component.selectAll.emit).toHaveBeenCalledWith(true);
      });
    });

    describe('deselecting all comics', () => {
      beforeEach(() => {
        component.dataSource.data.forEach(entry => (entry.selected = true));
        component.onHotkeyDeselectAll(event);
      });

      it('stops the event from propagating', () => {
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('emits an event', () => {
        expect(component.selectAll.emit).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('showing the filter popup', () => {
    beforeEach(() => {
      component.showComicFilterPopup = false;
      component.onFilterComics();
    });

    it('sets the show comic filter popup flag', () => {
      expect(component.showComicFilterPopup).toBeTrue();
    });
  });

  describe('updating metadata for a single comic book', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.onUpdateSingleComicBookMetadata(COMIC_DETAIL);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires a message', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateSingleComicBookMetadata({ comicBookId: COMIC_DETAIL.comicId })
      );
    });
  });

  describe('updating metadata for selected comic books', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.onUpdateSelectedComicBooksMetadata();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires a message', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateSelectedComicBooksMetadata()
      );
    });
  });

  describe('scraping comics', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.onScrapeComics(IDS);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('navigates to the metadata scraping page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/metadata/scraping');
    });
  });

  describe('rescanning comics', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
    });

    describe('rescanning a single comic book', () => {
      beforeEach(() => {
        component.onRescanSingleComicBook(COMIC_DETAIL);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          rescanSingleComicBook({ comicBookId: COMIC_DETAIL.comicId })
        );
      });
    });

    describe('rescanning selected comic books', () => {
      beforeEach(() => {
        component.onRescanSelectedComicBooks();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(rescanSelectedComicBooks());
      });
    });
  });
});
