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
import { ComicCoversComponent } from '@app/library/components/comic-covers/comic-covers.component';
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
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveTypePipe } from '@app/library/pipes/archive-type.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {
  QUERY_PARAM_ARCHIVE_TYPE,
  QUERY_PARAM_PAGE_INDEX
} from '@app/library/library.constants';
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

describe('LibraryPageComponent', () => {
  const USER = USER_READER;
  const PAGE_INDEX = 23;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadListState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState
  };

  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          LibraryPageComponent,
          LibraryToolbarComponent,
          ComicCoversComponent,
          ArchiveTypePipe,
          UnreadComicsPipe
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
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      activatedRoute = TestBed.inject(ActivatedRoute);
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

  describe('loading all pages', () => {
    const UNREAD = {
      ...COMIC_1,
      lastRead: null,
      comicState: ComicBookState.STABLE,
      comicVineId: 54321
    };
    const DELETED = {
      ...COMIC_2,
      lastRead: new Date().getTime(),
      comicState: ComicBookState.DELETED,
      comicVineId: 12345
    };
    const UNSCRAPED = {
      ...COMIC_3,
      lastRead: null,
      comicState: ComicBookState.STABLE,
      comicVineId: null
    };
    const UNPROCESSED = {
      ...COMIC_4,
      fileDetails: null
    };
    const CHANGED = {
      ...COMIC_4,
      comicState: ComicBookState.CHANGED
    };

    describe('for deleted comics', () => {
      beforeEach(() => {
        component.unreadOnly = false;
        component.deletedOnly = true;
        store.setState({
          ...initialState,
          [COMIC_LIST_FEATURE_KEY]: {
            ...initialComicListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the unread comics', () => {
        component.comics.every(comic =>
          expect(comic.comicState).toEqual(ComicBookState.DELETED)
        );
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
          [COMIC_LIST_FEATURE_KEY]: {
            ...initialComicListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the unscraped comics', () => {
        component.comics.every(comic => expect(comic.comicVineId).toBeNull());
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
          [COMIC_LIST_FEATURE_KEY]: {
            ...initialComicListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the changed comics', () => {
        component.comics.every(comic =>
          expect(comic.comicState).toEqual(ComicBookState.CHANGED)
        );
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
          [COMIC_LIST_FEATURE_KEY]: {
            ...initialComicListState,
            unprocessed: [UNPROCESSED],
            unscraped: [UNSCRAPED],
            changed: [CHANGED],
            deleted: [DELETED]
          }
        });
      });

      it('only loads the unprocessed comics', () => {
        component.comics.every(comic => expect(comic.fileDetails).toBeNull());
      });
    });
  });

  describe('loading the translations', () => {});

  describe('the page index query parameter', () => {
    beforeEach(() => {
      component.pageIndex = 0;
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_PAGE_INDEX]: `${PAGE_INDEX}`
      });
    });

    it('sets the page index', () => {
      expect(component.pageIndex).toEqual(PAGE_INDEX);
    });
  });

  describe('filtering by archive type', () => {
    describe('when it is CBZ', () => {
      const ARCHIVE_TYPE = ArchiveType.CBZ;

      beforeEach(() => {
        component.archiveTypeFilter = null;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_ARCHIVE_TYPE]: `${ARCHIVE_TYPE}`
        });
      });

      it('sets the archive type filter', () => {
        expect(component.archiveTypeFilter).toEqual(ARCHIVE_TYPE);
      });
    });

    describe('when it is CBR', () => {
      const ARCHIVE_TYPE = ArchiveType.CBR;

      beforeEach(() => {
        component.archiveTypeFilter = null;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_ARCHIVE_TYPE]: `${ARCHIVE_TYPE}`
        });
      });

      it('sets the archive type filter', () => {
        expect(component.archiveTypeFilter).toEqual(ARCHIVE_TYPE);
      });
    });

    describe('when it is CB7', () => {
      const ARCHIVE_TYPE = ArchiveType.CB7;

      beforeEach(() => {
        component.archiveTypeFilter = null;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_ARCHIVE_TYPE]: `${ARCHIVE_TYPE}`
        });
      });

      it('sets the archive type filter', () => {
        expect(component.archiveTypeFilter).toEqual(ARCHIVE_TYPE);
      });
    });

    describe('when it is not valid', () => {
      const ARCHIVE_TYPE = 'CBH';

      beforeEach(() => {
        component.archiveTypeFilter = null;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_ARCHIVE_TYPE]: `${ARCHIVE_TYPE}`
        });
      });

      it('clears the archive type filter', () => {
        expect(component.archiveTypeFilter).toBeNull();
      });
    });

    describe('when it is not provided', () => {
      const ARCHIVE_TYPE = null;

      beforeEach(() => {
        component.archiveTypeFilter = null;
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({});
      });

      it('clears the archive type filter', () => {
        expect(component.archiveTypeFilter).toBeNull();
      });
    });
  });

  describe('when the archive type filter is changed', () => {
    describe('when an value is selected', () => {
      beforeEach(() => {
        component.onArchiveTypeChanged(ArchiveType.CB7);
      });

      it('redirects the browser', () => {
        expect(router.navigate).toHaveBeenCalled();
      });
    });

    describe('when the value is cleared', () => {
      beforeEach(() => {
        component.onArchiveTypeChanged(null);
      });

      it('redirects the browser', () => {
        expect(router.navigate).toHaveBeenCalled();
      });
    });
  });

  describe('when the page index changes', () => {
    beforeEach(() => {
      component.onPageIndexChange(PAGE_INDEX);
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
