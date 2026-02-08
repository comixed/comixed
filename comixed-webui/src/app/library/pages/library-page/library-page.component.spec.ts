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
import { TitleService } from '@app/core/services/title.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MatMenuModule } from '@angular/material/menu';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveTypePipe } from '@app/library/pipes/archive-type.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  READING_LISTS_FEATURE_KEY,
  reducer as initialReadingListsState
} from '@app/lists/reducers/reading-lists.reducer';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { USER_READER } from '@app/user/user.fixtures';
import { CoverDateFilterPipe } from '@app/comic-books/pipes/cover-date-filter.pipe';
import { MatInputModule } from '@angular/material/input';
import { ComicListViewComponent } from '@app/comic-books/components/comic-list-view/comic-list-view.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBooksSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  setComicBookSelectionByUnreadState,
  setMultipleComicBookByFilterSelectionState
} from '@app/comic-books/actions/comic-book-selection.actions';
import {
  initialState as initialLibraryPluginState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';
import { PAGE_SIZE_DEFAULT, QUERY_PARAM_UNREAD_ONLY } from '@app/core';
import { PREFERENCE_PAGE_SIZE } from '@app/comic-files/comic-file.constants';
import {
  initialState as initialReadComicBooksState,
  READ_COMIC_BOOKS_FEATURE_KEY
} from '@app/user/reducers/read-comic-books.reducer';
import {
  loadComicsByFilter,
  loadReadComics,
  loadUnreadComics
} from '@app/comic-books/actions/comic-list.actions';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';

describe('LibraryPageComponent', () => {
  const ONE_DAY = 24 * 60 * 60 * 100;
  const PAGE_SIZE = PAGE_SIZE_DEFAULT * 2;
  const USER = {
    ...USER_READER,
    preferences: [{ name: PREFERENCE_PAGE_SIZE, value: `${PAGE_SIZE}` }]
  };
  const PAGE_INDEX = 23;
  const DATE = new Date();
  const COMIC_DETAILS = [
    {
      ...COMIC_DETAIL_1,
      coverDate: new Date(DATE.getTime() - 365 * ONE_DAY).getTime(), // last year
      archiveType: ArchiveType.CB7
    },
    {
      ...COMIC_DETAIL_2,
      coverDate: new Date(DATE.getTime() - 6 * 30 * ONE_DAY).getTime(), // six months ago
      archiveType: ArchiveType.CB7
    },
    {
      ...COMIC_DETAIL_3,
      coverDate: new Date(DATE.getTime() - (2 * 365 + 30) * ONE_DAY).getTime(), // two years and a month
      archiveType: ArchiveType.CBR
    },
    {
      ...COMIC_DETAIL_5,
      coverDate: new Date(DATE.getTime() - 10 * 365 * ONE_DAY).getTime(),
      archiveType: ArchiveType.CBZ
    }
  ];
  const IDS = COMIC_DETAILS.map(entry => entry.comicBookId);
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBooksSelectionState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginState,
    [READ_COMIC_BOOKS_FEATURE_KEY]: initialReadComicBooksState
  };

  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let activatedRoute: ActivatedRoute;
  let queryParameterService: jasmine.SpyObj<QueryParameterService>;
  let confirmationService: ConfirmationService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatTreeModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatDialogModule,
        MatMenuModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatDividerModule,
        MatSortModule,
        MatInputModule,
        MatTableModule,
        MatCheckboxModule,
        LibraryPageComponent,
        ComicListViewComponent,
        ArchiveTypePipe,
        CoverDateFilterPipe,
        ComicCoverUrlPipe,
        ComicTitlePipe
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
        TitleService,
        {
          provide: QueryParameterService,
          useValue: {
            pageSize$: new BehaviorSubject<number>(10),
            pageIndex$: new BehaviorSubject<number>(0),
            coverYear$: new BehaviorSubject<CoverDateFilter>({
              year: null,
              month: null
            }),
            archiveType$: new BehaviorSubject<ArchiveType>(null),
            filterText$: new BehaviorSubject<string>(null),
            comicType$: new BehaviorSubject<ComicType>(null),
            pageCount$: new BehaviorSubject<number | null>(null),
            sortBy$: new BehaviorSubject<ComicType>(null),
            sortDirection$: new BehaviorSubject<ComicType>(null),
            updateQueryParam: jasmine.createSpy(
              'QueryParameterService.updateQueryParam()'
            )
          }
        },
        ConfirmationService
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
    queryParameterService = TestBed.inject(
      QueryParameterService
    ) as jasmine.SpyObj<QueryParameterService>;
    confirmationService = TestBed.inject(ConfirmationService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  }));

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

    describe('when showing selected comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({
          selected: true
        });
      });

      it('sets the selected only flag', () => {
        expect(component.selectedOnly).toBeTrue();
      });
    });

    describe('when showing unprocessed comics', () => {
      beforeEach(() => {
        (activatedRoute.data as BehaviorSubject<{}>).next({
          unprocessed: true
        });
      });

      it('sets the unprocessed only flag', () => {
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

    it('updates the page title for selected comics', () => {
      component.selectedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unprocessed comics', () => {
      component.unprocessedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unread comics', () => {
      component.unreadOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for unscraped comics', () => {
      component.unscrapedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for changed comics', () => {
      component.changedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('updates the page title for deleted comics', () => {
      component.deletedOnly = true;
      translateService.use('fr');
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading the comic details to display', () => {
    describe('for unprocessed comics', () => {
      beforeEach(() => {
        component.unprocessedOnly = true;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          foo: 'bar'
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicsByFilter({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.UNPROCESSED,
            selected: false,
            missing: false,
            unscrapedState: false,
            searchText: null,
            publisher: null,
            series: null,
            volume: null,
            pageCount: null,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });

    describe('for deleted comics', () => {
      beforeEach(() => {
        component.deletedOnly = true;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          foo: 'bar'
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicsByFilter({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.DELETED,
            selected: false,
            missing: false,
            unscrapedState: false,
            searchText: null,
            publisher: null,
            series: null,
            volume: null,
            pageCount: null,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });

    describe('for changed comics', () => {
      beforeEach(() => {
        component.changedOnly = true;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          foo: 'bar'
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicsByFilter({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.CHANGED,
            selected: false,
            missing: false,
            unscrapedState: false,
            searchText: null,
            publisher: null,
            series: null,
            volume: null,
            pageCount: null,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });

    describe('for unread comics', () => {
      beforeEach(() => {
        component.unreadOnly = true;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_UNREAD_ONLY]: `${false}`
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadUnreadComics({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });

    describe('for read comics', () => {
      beforeEach(() => {
        component.unreadOnly = true;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_UNREAD_ONLY]: `${true}`
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadReadComics({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });

    describe('for all comics', () => {
      beforeEach(() => {
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          foo: 'bar'
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicsByFilter({
            pageSize: PAGE_SIZE,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: null,
            selected: false,
            missing: false,
            unscrapedState: false,
            searchText: null,
            publisher: null,
            series: null,
            volume: null,
            pageCount: null,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });
  });

  describe('selecting all displayable comics', () => {
    const SELECTED = Math.random() > 0.5;

    describe('for read comic books', () => {
      beforeEach(() => {
        component.unreadOnly = true;
        component.showReadOnly = true;
        component.onSetAllComicsSelectedState(SELECTED);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBookSelectionByUnreadState({
            selected: SELECTED,
            unreadOnly: false
          })
        );
      });
    });

    describe('for unread comic books', () => {
      beforeEach(() => {
        component.unreadOnly = true;
        component.showReadOnly = false;
        component.onSetAllComicsSelectedState(SELECTED);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicBookSelectionByUnreadState({
            selected: SELECTED,
            unreadOnly: true
          })
        );
      });
    });

    describe('for all comic books', () => {
      beforeEach(() => {
        component.onSetAllComicsSelectedState(SELECTED);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setMultipleComicBookByFilterSelectionState({
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: null,
            unscrapedState: false,
            searchText: null,
            selected: SELECTED
          })
        );
      });
    });
  });

  describe('toggling the read/unread state', () => {
    const TOGGLE = Math.random() > 0.5;

    beforeEach(() => {
      component.showReadOnly = TOGGLE;
      component.onToggleUnreadOnly();
    });

    it('updates the url', () => {
      expect(queryParameterService.updateQueryParam).toHaveBeenCalledWith([
        {
          name: QUERY_PARAM_UNREAD_ONLY,
          value: `${!TOGGLE}`
        }
      ]);
    });
  });
});
