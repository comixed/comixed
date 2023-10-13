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
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
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
import { CoverDateFilterPipe } from '@app/comic-books/pipes/cover-date-filter.pipe';
import {
  initialState as initialLibrarySelectionState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';
import { MatInputModule } from '@angular/material/input';
import { ComicDetailListViewComponent } from '@app/comic-books/components/comic-detail-list-view/comic-detail-list-view.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { ConfirmationService } from '@tragically-slick/confirmation';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  initialState as initialComicDetailListState
} from '@app/comic-books/reducers/comic-details-list.reducer';
import { ComicType } from '@app/comic-books/models/comic-type';
import { loadComicDetails } from '@app/comic-books/actions/comics-details-list.actions';
import { ComicState } from '@app/comic-books/models/comic-state';

describe('LibraryPageComponent', () => {
  const ONE_DAY = 24 * 60 * 60 * 100;
  const USER = USER_READER;
  const PAGE_INDEX = 23;
  const DATE = new Date();
  const COMIC_BOOKS = [
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
  const IDS = COMIC_BOOKS.map(comicBook => comicBook.id);
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: initialComicBookListState,
    [COMIC_DETAILS_LIST_FEATURE_KEY]: initialComicDetailListState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadListState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState
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

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          LibraryPageComponent,
          ComicDetailListViewComponent,
          ArchiveTypePipe,
          CoverDateFilterPipe,
          ComicCoverUrlPipe,
          ComicTitlePipe
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
          MatCheckboxModule
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
              sortBy$: new BehaviorSubject<ComicType>(null),
              sortDirection$: new BehaviorSubject<ComicType>(null)
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
          loadComicDetails({
            pageSize: 10,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.UNPROCESSED,
            readState: false,
            unscrapedState: false,
            searchText: null,
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
          loadComicDetails({
            pageSize: 10,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.DELETED,
            readState: false,
            unscrapedState: false,
            searchText: null,
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
          loadComicDetails({
            pageSize: 10,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: ComicState.CHANGED,
            readState: false,
            unscrapedState: false,
            searchText: null,
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
          loadComicDetails({
            pageSize: 10,
            pageIndex: 0,
            coverYear: null,
            coverMonth: null,
            archiveType: null,
            comicType: null,
            comicState: null,
            readState: false,
            unscrapedState: false,
            searchText: null,
            sortBy: null,
            sortDirection: null
          })
        );
      });
    });
  });
});
