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
import { CollectionDetailComponent } from './collection-detail.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TagType } from '@app/collections/models/comic-collection.enum';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {
  READING_LISTS_FEATURE_KEY,
  reducer as initialReadingListsState
} from '@app/lists/reducers/reading-lists.reducer';
import { MatDividerModule } from '@angular/material/divider';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { TitleService } from '@app/core/services/title.service';
import { MatSortModule } from '@angular/material/sort';
import { ArchiveTypePipe } from '@app/library/pipes/archive-type.pipe';
import { USER_READER } from '@app/user/user.fixtures';
import { CoverDateFilterPipe } from '@app/comic-books/pipes/cover-date-filter.pipe';
import {
  deselectComicBooks,
  selectComicBooks
} from '@app/library/actions/library-selections.actions';
import {
  initialState as initialLibrarySelectionState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import { MatInputModule } from '@angular/material/input';
import { ComicDetailListViewComponent } from '@app/comic-books/components/comic-detail-list-view/comic-detail-list-view.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  initialState as initialComicDetailListState
} from '@app/comic-books/reducers/comic-details-list.reducer';
import { loadComicDetailsForCollection } from '@app/comic-books/actions/comic-details-list.actions';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION
} from '@app/core';
import { setMultipleComicBooksByTagTypeAndValueSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';

describe('CollectionDetailComponent', () => {
  const PAGE_SIZE = 10;
  const PAGE_INDEX = 5;
  const SORT_BY = 'added-date';
  const SORT_DIRECTION = 'asc';
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    { ...COMIC_DETAIL_2, publisher: null, series: null, volume: null },
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const IDS = COMIC_DETAILS.map(comic => comic.comicId);
  const USER = USER_READER;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [COMIC_DETAILS_LIST_FEATURE_KEY]: {
      ...initialComicDetailListState,
      comicBooks: COMIC_DETAILS
    },
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  let store: MockStore<any>;
  let storeDispatch: jasmine.Spy;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          CollectionDetailComponent,
          ComicDetailListViewComponent,
          ComicTitlePipe,
          ComicCoverUrlPipe,
          ArchiveTypePipe,
          CoverDateFilterPipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule,
          MatMenuModule,
          MatIconModule,
          MatPaginatorModule,
          MatFormFieldModule,
          MatTooltipModule,
          MatToolbarModule,
          MatSelectModule,
          MatOptionModule,
          MatDividerModule,
          MatSortModule,
          MatPaginatorModule,
          MatInputModule,
          MatTableModule,
          MatCheckboxModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject<{}>({
                collectionType: TagType.CHARACTERS,
                collectionName: 'Batman'
              }),
              queryParams: new BehaviorSubject<{}>({}),
              snapshot: {} as ActivatedRouteSnapshot
            }
          },
          TitleService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CollectionDetailComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      storeDispatch = spyOn(store, 'dispatch');
      activatedRoute = TestBed.inject(ActivatedRoute);
      router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
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

  describe('when the collection type is invalid', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: 'invalid'
      });
    });

    it('redirects to the library', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/library');
    });
  });

  describe('when the collection details are received', () => {
    const COLLECTION_TYPE = 'stories';
    const COLLECTION_NAME = 'The Collection';

    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: COLLECTION_TYPE,
        collectionName: COLLECTION_NAME
      });
    });

    it('sets the collection type', () => {
      expect(component.tagType).toEqual(TagType.STORIES);
    });

    it('sets the routable type name', () => {
      expect(component.routableTypeName).toEqual(COLLECTION_TYPE);
    });

    it('sets the collection name', () => {
      expect(component.tagValue).toEqual(COLLECTION_NAME);
    });

    it('subscribes to comic updates', () => {
      expect(component.comicDetailListSubscription).not.toBeNull();
    });

    it('subscribes to selection updates', () => {
      expect(component.selectedSubscription).not.toBeNull();
    });
  });

  describe('show collections', () => {
    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_PAGE_SIZE]: `${PAGE_SIZE}`,
        [QUERY_PARAM_PAGE_INDEX]: `${PAGE_INDEX}`,
        [QUERY_PARAM_SORT_BY]: SORT_BY,
        [QUERY_PARAM_SORT_DIRECTION]: SORT_DIRECTION
      });
      storeDispatch.calls.reset();
    });

    describe('when the collection type is characters', () => {
      const TAG_VALUE = COMIC_DETAILS[0].tags.find(
        entry => entry.type === ComicTagType.CHARACTER
      ).value;

      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'characters',
          collectionName: TAG_VALUE,
          volume: COMIC_DETAILS[0].volume
        });
      });

      it('selects comics', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicDetailsForCollection({
            pageSize: PAGE_SIZE,
            pageIndex: PAGE_INDEX,
            tagType: TagType.CHARACTERS,
            tagValue: TAG_VALUE,
            sortBy: SORT_BY,
            sortDirection: SORT_DIRECTION
          })
        );
      });
    });

    describe('when the collection type is teams', () => {
      const TAG_VALUE = COMIC_DETAILS[0].tags.find(
        entry => entry.type === ComicTagType.TEAM
      ).value;

      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'teams',
          collectionName: TAG_VALUE,
          volume: COMIC_DETAILS[0].volume
        });
      });

      it('selects comics', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicDetailsForCollection({
            pageSize: PAGE_SIZE,
            pageIndex: PAGE_INDEX,
            tagType: TagType.TEAMS,
            tagValue: TAG_VALUE,
            sortBy: SORT_BY,
            sortDirection: SORT_DIRECTION
          })
        );
      });
    });

    describe('when the collection type is locations', () => {
      const TAG_VALUE = COMIC_DETAILS[0].tags.find(
        entry => entry.type === ComicTagType.LOCATION
      ).value;

      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'locations',
          collectionName: TAG_VALUE,
          volume: COMIC_DETAILS[0].volume
        });
      });

      it('selects comics', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicDetailsForCollection({
            pageSize: PAGE_SIZE,
            pageIndex: PAGE_INDEX,
            tagType: TagType.LOCATIONS,
            tagValue: TAG_VALUE,
            sortBy: SORT_BY,
            sortDirection: SORT_DIRECTION
          })
        );
      });
    });

    describe('when the collection type is stories', () => {
      const TAG_VALUE = COMIC_DETAILS[0].tags.find(
        entry => entry.type === ComicTagType.STORY
      ).value;

      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'stories',
          collectionName: TAG_VALUE,
          volume: COMIC_DETAILS[0].volume
        });
      });

      it('selects comics', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicDetailsForCollection({
            pageSize: PAGE_SIZE,
            pageIndex: PAGE_INDEX,
            tagType: TagType.STORIES,
            tagValue: TAG_VALUE,
            sortBy: SORT_BY,
            sortDirection: SORT_DIRECTION
          })
        );
      });
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_DETAILS;
      component.onSelectAllComics(true);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        selectComicBooks({ ids: IDS })
      );
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

  describe('selecting all comic books', () => {
    const SELECT = Math.random() > 0.5;
    const TAG_TYPE = TagType.LOCATIONS;
    const TAG_VALUE = 'Wakanda';

    beforeEach(() => {
      component.tagType = TAG_TYPE;
      component.tagValue = TAG_VALUE;
      component.onSelectAll(SELECT);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setMultipleComicBooksByTagTypeAndValueSelectionState({
          selected: SELECT,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE
        })
      );
    });
  });
});
