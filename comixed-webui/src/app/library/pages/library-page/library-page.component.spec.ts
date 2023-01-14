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
import { LibraryPageComponent } from './library-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatBadgeModule } from '@angular/material/badge';
import { TitleService } from '@app/core/services/title.service';
import { ComicBookCoversComponent } from '@app/library/components/comic-book-covers/comic-book-covers.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveTypePipe } from '@app/library/pipes/archive-type.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { UnreadComicsPipe } from '@app/library/pipes/unread-comics.pipe';
import {
  initialState as initialLastReadListState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/last-read/reducers/last-read-list.reducer';
import {
  READING_LISTS_FEATURE_KEY,
  reducer as initialReadingListsState
} from '@app/lists/reducers/reading-lists.reducer';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { USER_READER } from '@app/user/user.fixtures';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { CoverDateFilterPipe } from '@app/comic-books/pipes/cover-date-filter.pipe';
import {
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import {
  initialState as initialLibrarySelectionState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';
import { ComicBook } from '@app/comic-books/models/comic-book';

describe('LibraryPageComponent', () => {
  const USER = USER_READER;
  const PAGE_INDEX = 23;
  const DATE = new Date();
  const COMIC_BOOKS = [
    {
      ...COMIC_DETAIL_1,
      coverDate: new Date(DATE.getTime() - 365 * 24 * 60 * 60 * 1000).getTime(), // last year
      archiveType: ArchiveType.CB7
    },
    {
      ...COMIC_DETAIL_2,
      coverDate: new Date(
        DATE.getTime() - 6 * 30 * 24 * 60 * 60 * 1000
      ).getTime(), // six months ago
      archiveType: ArchiveType.CB7
    },
    {
      ...COMIC_DETAIL_3,
      coverDate: new Date(DATE.getTime() - 760 * 24 * 60 * 60 * 1000).getTime(), // two years and a month
      archiveType: ArchiveType.CBR
    },
    {
      ...COMIC_DETAIL_5,
      coverDate: new Date().getTime(),
      archiveType: ArchiveType.CBZ
    }
  ];
  const IDS = COMIC_BOOKS.map(comicBook => comicBook.comicId);
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: initialComicBookListState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadListState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState
  };

  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let activatedRoute: ActivatedRoute;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          LibraryPageComponent,
          LibraryToolbarComponent,
          ComicBookCoversComponent,
          ArchiveTypePipe,
          UnreadComicsPipe,
          CoverDateFilterPipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatSidenavModule,
          MatToolbarModule,
          MatIconModule,
          MatTreeModule,
          MatBadgeModule,
          MatPaginatorModule,
          MatFormFieldModule,
          MatTooltipModule,
          MatDialogModule,
          MatMenuModule,
          MatFormFieldModule,
          MatSelectModule,
          MatOptionModule,
          MatDividerModule,
          MatSortModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: ActivatedRoute,
            useValue: {
              data: new BehaviorSubject<{}>({}),
              snapshot: {} as ActivatedRouteSnapshot,
              queryParams: new BehaviorSubject<{}>({}),
              params: new BehaviorSubject<{}>({})
            }
          },
          TitleService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(LibraryPageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      activatedRoute = TestBed.inject(ActivatedRoute);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading page data', () => {
    beforeEach(() => {
      component.unprocessedOnly = false;
      component.unreadOnly = false;
      component.unscrapedOnly = false;
      component.changedOnly = false;
      component.deletedOnly = false;
    });

    describe('when showing unprocessed comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({
          unprocessed: true
        });
      });

      it('sets the unread only flag', () => {
        expect(component.unprocessedOnly).toBeTrue();
      });
    });

    describe('when showing unread comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({ unread: true });
      });

      it('sets the unread only flag', () => {
        expect(component.unreadOnly).toBeTrue();
      });
    });

    describe('when showing unscraped comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({ unscraped: true });
      });

      it('sets the unscraped only flag', () => {
        expect(component.unscrapedOnly).toBeTrue();
      });
    });

    describe('when changedOnly unscraped comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({ changed: true });
      });

      it('sets the unscraped only flag', () => {
        expect(component.changedOnly).toBeTrue();
      });
    });

    describe('when showing deleted comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({ deleted: true });
      });

      it('sets the deleted only flag', () => {
        expect(component.deletedOnly).toBeTrue();
      });
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.unprocessedOnly = false;
      component.unreadOnly = false;
      component.unscrapedOnly = false;
      component.changedOnly = false;
      component.deletedOnly = false;
    });

    it('updates the page title for all comic', () => {
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unprocessed comic', () => {
      component.unprocessedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unread comic', () => {
      component.unreadOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unscraped comic', () => {
      component.unscrapedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for changed comic', () => {
      component.changedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for deleted comic', () => {
      component.deletedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading all pages', () => {
    const UNREAD = {
      ...COMIC_DETAIL_1,
      lastRead: null,
      detail: { ...COMIC_DETAIL_1, state: ComicBookState.STABLE },
      metadataSource: {
        metadataSource: { id: 54321 } as MetadataSource
      } as ComicMetadataSource
    };
    const DELETED = {
      ...COMIC_DETAIL_2,
      lastRead: new Date().getTime(),
      detail: { ...COMIC_DETAIL_2, state: ComicBookState.DELETED },
      metadataSource: {
        metadataSource: { id: 12345 } as MetadataSource
      } as ComicMetadataSource
    };
    const UNSCRAPED = {
      ...COMIC_DETAIL_3,
      lastRead: null,
      detail: {
        ...COMIC_DETAIL_3,
        comicState: ComicBookState.STABLE,
        publisher: '',
        series: ''
      }
    };
    const UNPROCESSED = {
      ...COMIC_DETAIL_4,
      detail: { ...COMIC_DETAIL_4, state: ComicBookState.UNPROCESSED }
    };
    const CHANGED = {
      ...COMIC_DETAIL_4,
      detail: { ...COMIC_DETAIL_4, state: ComicBookState.CHANGED }
    };

    describe('for deleted comics', () => {
      beforeEach(() => {
        component.unreadOnly = false;
        component.deletedOnly = true;
        store.setState({
          ...initialState,
          [COMIC_BOOK_LIST_FEATURE_KEY]: {
            ...initialComicBookListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the unread comics', () => {
        expect(component.comicBooks).toEqual([DELETED]);
      });
    });

    describe('for unscraped comics', () => {
      beforeEach(() => {
        component.unreadOnly = false;
        component.deletedOnly = false;
        component.unscrapedOnly = true;
        component.changedOnly = false;
        component.unprocessedOnly = false;
        store.setState({
          ...initialState,
          [COMIC_BOOK_LIST_FEATURE_KEY]: {
            ...initialComicBookListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the unscraped comics', () => {
        expect(component.comicBooks).toEqual([UNSCRAPED]);
      });
    });

    describe('for changed comics', () => {
      beforeEach(() => {
        component.unreadOnly = false;
        component.deletedOnly = false;
        component.unscrapedOnly = false;
        component.changedOnly = true;
        component.unprocessedOnly = false;
        store.setState({
          ...initialState,
          [COMIC_BOOK_LIST_FEATURE_KEY]: {
            ...initialComicBookListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the changed comics', () => {
        expect(component.comicBooks).toEqual([CHANGED]);
      });
    });

    describe('for unprocessed comics', () => {
      beforeEach(() => {
        component.unreadOnly = false;
        component.deletedOnly = false;
        component.unscrapedOnly = false;
        component.changedOnly = false;
        component.unprocessedOnly = true;
        store.setState({
          ...initialState,
          [COMIC_BOOK_LIST_FEATURE_KEY]: {
            ...initialComicBookListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the unprocessed comics', () => {
        expect(component.comicBooks).toEqual([UNPROCESSED]);
      });
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_BOOKS;
    });

    describe('when filtering by read status', () => {
      beforeEach(() => {
        component.lastReadDates = [
          {
            id: 1,
            lastRead: new Date().getTime(),
            comicBook: {
              id: COMIC_BOOKS[0].comicId
            } as ComicBook
          },
          {
            id: 2,
            lastRead: new Date().getTime(),
            comicBook: {
              id: COMIC_BOOKS[1].comicId
            } as ComicBook
          }
        ];
        component.unreadOnly = true;
        component.onSelectAllComics(true);
      });

      it('only selects unread comics', () => {
        const lastReadIds = component.lastReadDates.map(date => date.id);
        const ids = COMIC_BOOKS.filter(
          book => !lastReadIds.includes(book.comicId)
        ).map(book => book.comicId);
        expect(store.dispatch).toHaveBeenCalledWith(selectComicBooks({ ids }));
      });
    });

    describe('deselecting comics', () => {
      beforeEach(() => {
        component.selectedIds = IDS;
        component.onSelectAllComics(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComicBooks({ ids: IDS })
        );
      });
    });
  });
});
