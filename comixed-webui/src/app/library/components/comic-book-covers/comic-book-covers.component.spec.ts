/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { ComicBookCoversComponent } from './comic-book-covers.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatTreeModule } from '@angular/material/tree';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatBadgeModule } from '@angular/material/badge';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4
} from '@app/comic-books/comic-books.fixtures';
import { editMultipleComics } from '@app/library/actions/library.actions';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { archiveTypeFromString } from '@app/comic-books/models/archive-type.enum';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import { MatDividerModule } from '@angular/material/divider';
import { addComicsToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { READING_LIST_1 } from '@app/lists/lists.fixtures';
import { convertComics } from '@app/library/actions/convert-comics.actions';
import { setComicBooksRead } from '@app/last-read/actions/set-comics-read.actions';
import {
  LAST_READ_1,
  LAST_READ_3,
  LAST_READ_5
} from '@app/last-read/last-read.fixtures';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { MatSortModule } from '@angular/material/sort';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { FileDownloadService } from '@app/core/services/file-download.service';
import { of } from 'rxjs';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { ComicBookListComponent } from '@app/library/components/comic-book-list/comic-book-list.component';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import {
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';

describe('ComicBookCoversComponent', () => {
  const PAGINATION = 25;
  const PAGE_INDEX = 23;
  const COMIC_BOOK = COMIC_BOOK_2;
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_2, COMIC_BOOK_3, COMIC_BOOK_4];
  const IDS = [COMIC_BOOK_1.id, COMIC_BOOK_3.id];
  const COMIC_BOOK_DETAILS: EditMultipleComics = {
    publisher: 'The Publisher',
    series: 'The Series',
    volume: '1234',
    issueNumber: '777',
    imprint: 'The Imprint'
  };
  const READING_LIST = READING_LIST_1;
  const LAST_READ_DATES = [LAST_READ_1, LAST_READ_3, LAST_READ_5];
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_READER }
  };

  let component: ComicBookCoversComponent;
  let fixture: ComponentFixture<ComicBookCoversComponent>;
  let store: MockStore<any>;
  let dialog: MatDialog;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;
  let paginator: ComponentFixture<MatPaginator>;
  let fileDownloadService: FileDownloadService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ComicBookCoversComponent,
          ComicBookListComponent,
          LibraryToolbarComponent
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatSidenavModule,
          MatToolbarModule,
          MatIconModule,
          MatPaginatorModule,
          MatTreeModule,
          MatBadgeModule,
          MatFormFieldModule,
          MatTooltipModule,
          MatDialogModule,
          MatMenuModule,
          MatSelectModule,
          MatOptionModule,
          MatDividerModule,
          MatSortModule
        ],
        providers: [
          provideMockStore({ initialState }),
          ConfirmationService,
          FileDownloadService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicBookCoversComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      dialog = TestBed.inject(MatDialog);
      translateService = TestBed.inject(TranslateService);
      confirmationService = TestBed.inject(ConfirmationService);
      paginator = TestBed.createComponent(MatPaginator);
      fileDownloadService = TestBed.inject(FileDownloadService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comics to display', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      component.comicBooks = COMIC_BOOKS;
    });

    it('loads the comics to display', () => {
      expect(component.comicBooks).toEqual(COMIC_BOOKS);
    });
  });

  describe('checking if a comic is selected', () => {
    beforeEach(() => {
      component.selectedIds = [COMIC_BOOK_1.id];
    });

    it('returns true for selected comics', () => {
      expect(component.isSelected(COMIC_BOOK_1)).toBeTrue();
    });

    it('returns false for unselected comics', () => {
      expect(component.isSelected(COMIC_BOOK_2)).toBeFalse();
    });
  });

  describe('when a comic select event is received', () => {
    describe('selecting a comic', () => {
      beforeEach(() => {
        component.onSelectionChanged(COMIC_BOOK, true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComicBooks({ ids: [COMIC_BOOK.id] })
        );
      });
    });

    describe('deselecting a comic', () => {
      beforeEach(() => {
        component.onSelectionChanged(COMIC_BOOK, false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComicBooks({ ids: [COMIC_BOOK.id] })
        );
      });
    });
  });

  describe('showing the context menu', () => {
    const XPOS = '7';
    const YPOS = '17';

    beforeEach(() => {
      component.comic = null;
      spyOn(component.contextMenu, 'openMenu');
      component.onShowContextMenu(COMIC_BOOK, XPOS, YPOS);
    });

    it('sets the current comic', () => {
      expect(component.comic).toEqual(COMIC_BOOK);
    });

    it('set the context menu x position', () => {
      expect(component.contextMenuX).toEqual(XPOS);
    });

    it('set the context menu y position', () => {
      expect(component.contextMenuY).toEqual(YPOS);
    });

    it('shows the context menu', () => {
      expect(component.contextMenu.openMenu).toHaveBeenCalled();
    });
  });

  describe('showing the comic details dialog', () => {
    beforeEach(() => {
      spyOn(dialog, 'open');
      component.onShowComicDetails(COMIC_BOOK);
    });

    it('opens the comic details dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(ComicDetailsDialogComponent, {
        data: COMIC_BOOK
      });
    });
  });

  describe('setting the read state', () => {
    const READ = Math.random() > 0.5;

    describe('for one comic', () => {
      beforeEach(() => {
        component.onMarkOneComicRead(COMIC_BOOK, READ);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBooksRead({ comicBooks: [COMIC_BOOK], read: READ })
        );
      });
    });

    describe('for selected comic', () => {
      beforeEach(() => {
        component.comicBooks = COMIC_BOOKS;
        component.selectedIds = IDS;
        component.onMarkMultipleComicsRead(READ);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBooksRead({
            comicBooks: COMIC_BOOKS.filter(comicBook =>
              IDS.includes(comicBook.id)
            ),
            read: READ
          })
        );
      });
    });
  });

  describe('checking if a comic is changed', () => {
    it('returns false when ADDED', () => {
      expect(
        component.isChanged({ ...COMIC_BOOK, comicState: ComicBookState.ADDED })
      ).toBeFalse();
    });

    it('returns true when CHANGED', () => {
      expect(
        component.isChanged({
          ...COMIC_BOOK,
          comicState: ComicBookState.CHANGED
        })
      ).toBeTrue();
    });

    it('returns true when STABLE', () => {
      expect(
        component.isChanged({
          ...COMIC_BOOK,
          comicState: ComicBookState.STABLE
        })
      ).toBeFalse();
    });

    it('returns true when DELETED', () => {
      expect(
        component.isChanged({
          ...COMIC_BOOK,
          comicState: ComicBookState.DELETED
        })
      ).toBeFalse();
    });
  });

  describe('updating the comic info', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUpdateMetadata(COMIC_BOOK);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateMetadata({ ids: [COMIC_BOOK.id] })
      );
    });
  });

  describe('marking comics for deletion', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_BOOKS;
      component.selectedIds = IDS;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
    });

    describe('for a single comic', () => {
      beforeEach(() => {
        component.onMarkAsDeleted(COMIC_BOOKS[0], true);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({ comicBooks: [COMIC_BOOKS[0]], deleted: true })
        );
      });
    });

    describe('for multiple comics', () => {
      beforeEach(() => {
        component.onMarkSelectedDeleted(true);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({
            comicBooks: COMIC_BOOKS.filter(comicBook =>
              IDS.includes(comicBook.id)
            ),
            deleted: true
          })
        );
      });
    });
  });

  describe('unmarking comics for deletion', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_BOOKS;
      component.selectedIds = IDS;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
    });

    describe('for a single comic', () => {
      beforeEach(() => {
        component.onMarkAsDeleted(COMIC_BOOKS[0], false);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({ comicBooks: [COMIC_BOOKS[0]], deleted: false })
        );
      });
    });

    describe('for multiple comics', () => {
      beforeEach(() => {
        component.onMarkSelectedDeleted(false);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markComicsDeleted({
            comicBooks: COMIC_BOOKS.filter(comicBook =>
              IDS.includes(comicBook.id)
            ),
            deleted: false
          })
        );
      });
    });
  });

  describe('adding comics to a reading list', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_BOOKS;
      component.selectedIds = IDS;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.addSelectedToReadingList(READING_LIST);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        addComicsToReadingList({
          list: READING_LIST,
          comicBooks: COMIC_BOOKS.filter(comicBook =>
            IDS.includes(comicBook.id)
          )
        })
      );
    });
  });

  describe('converting a single comic', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onConvertOne(COMIC_BOOK, 'CBZ');
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        convertComics({
          comicBooks: [COMIC_BOOK],
          archiveType: archiveTypeFromString('CBZ'),
          renamePages: true,
          deletePages: true
        })
      );
    });
  });

  describe('converting the comic selection', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comicBooks = COMIC_BOOKS;
      component.selectedIds = IDS;
      component.onConvertSelected('CB7');
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        convertComics({
          comicBooks: COMIC_BOOKS.filter(comicBook =>
            IDS.includes(comicBook.id)
          ),
          archiveType: archiveTypeFromString('CB7'),
          renamePages: true,
          deletePages: true
        })
      );
    });
  });

  describe('comic last read states', () => {
    beforeEach(() => {
      component.lastRead = LAST_READ_DATES;
    });

    it('stores the read comic ids', () => {
      expect(component.readComicIds).toEqual(
        LAST_READ_DATES.map(entry => entry.comicBook.id)
      );
    });

    it('identifies read comics', () => {
      expect(
        component.isRead(LAST_READ_DATES[0].comicBook as ComicBook)
      ).toBeTrue();
    });
  });

  describe('sorting comics', () => {
    const LEFT = {
      ...COMIC_BOOK,
      coverDate: new Date().getTime(),
      addedDate: new Date().getTime() - 24 * 60 * 60 * 1000,
      sortableIssueNumber: '00010'
    };
    const MIDDLE = {
      ...COMIC_BOOK,
      coverDate: new Date().getTime(),
      addedDate: new Date().getTime() + 24 * 60 * 60 * 1000,
      sortableIssueNumber: '00010'
    };
    const RIGHT = {
      ...COMIC_BOOK,
      coverDate: new Date().getTime() - 24 * 60 * 60 * 1000,
      addedDate: new Date().getTime(),
      sortableIssueNumber: '00020'
    };

    describe('sorting by added date', () => {
      beforeEach(() => {
        component.comicBooks = [RIGHT, LEFT];
        component.sortField = 'added-date';
      });

      it('sorts correctly', () => {
        expect(component.dataSource.data[0]).toEqual(LEFT);
      });
    });

    describe('sorting by cover date', () => {
      beforeEach(() => {
        component.comicBooks = [LEFT, RIGHT];
        component.sortField = 'cover-date';
      });

      it('sorts correctly', () => {
        expect(component.dataSource.data[0]).toEqual(RIGHT);
      });
    });

    describe('sorting by issue number', () => {
      describe('when the issue numbers differ', () => {
        beforeEach(() => {
          component.comicBooks = [RIGHT, LEFT];
          component.sortField = 'issue-number';
        });

        it('sorts correctly', () => {
          expect(component.dataSource.data[0]).toEqual(LEFT);
        });
      });

      describe('when the issue numbers are the same', () => {
        beforeEach(() => {
          component.comicBooks = [
            RIGHT,
            MIDDLE,
            { ...LEFT, sortableIssueNumber: RIGHT.sortableIssueNumber }
          ];
          component.sortField = 'issue-number';
        });

        it('sorts correctly', () => {
          expect(component.dataSource.data[0]).toEqual(MIDDLE);
        });
      });
    });
  });

  describe('setting the page index', () => {
    beforeEach(() => {
      component.dataSource.paginator = paginator.componentInstance;
      component.pageIndex = PAGE_INDEX;
    });

    it('sets the page index for the paginator', () => {
      expect(paginator.componentInstance.pageIndex).toEqual(PAGE_INDEX);
    });
  });

  describe('downloading comic metadata', () => {
    beforeEach(() => {
      spyOn(fileDownloadService, 'saveFileContent');
      component.downloadComicData(COMIC_BOOKS);
    });

    it('downloads the file detail', () => {
      expect(fileDownloadService.saveFileContent).toHaveBeenCalled();
    });
  });

  describe('checking if a comic is deleted', () => {
    it('returns true when the comic is in the deleted state', () => {
      expect(
        component.isDeleted({
          ...COMIC_BOOK,
          comicState: ComicBookState.DELETED
        })
      ).toBeTrue();
    });

    it('returns false when the comic is not in the deleted state', () => {
      expect(
        component.isDeleted({
          ...COMIC_BOOK,
          comicState: ComicBookState.CHANGED
        })
      ).toBeFalse();
    });
  });

  describe('editing multiple comics', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      const dialogRef = jasmine.createSpyObj(['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(COMIC_BOOK_DETAILS));
      spyOn(dialog, 'open').and.returnValue(dialogRef);
      component.comicBooks = COMIC_BOOKS;
      component.selectedIds = IDS;
      component.onEditMultipleComics();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action to edit multiple comics', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        editMultipleComics({
          comicBooks: COMIC_BOOKS.filter(comicBook =>
            IDS.includes(comicBook.id)
          ),
          details: COMIC_BOOK_DETAILS
        })
      );
    });
  });

  describe('cancelling editing multiple comics', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      const dialogRef = jasmine.createSpyObj(['afterClosed']);
      dialogRef.afterClosed.and.returnValue(of(null));
      spyOn(dialog, 'open').and.returnValue(dialogRef);
      component.selectedIds = IDS;
      component.onEditMultipleComics();
    });

    it('does not confirm with the user', () => {
      expect(confirmationService.confirm).not.toHaveBeenCalled();
    });

    it('does not fire an action', () => {
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });
});
