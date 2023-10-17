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
import { CollectionType } from '@app/collections/models/comic-collection.enum';
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
import { MISSING_VOLUME_PLACEHOLDER } from '@app/comic-books/comic-books.constants';
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

describe('CollectionDetailComponent', () => {
  const COMIC_BOOKS = [
    COMIC_DETAIL_1,
    { ...COMIC_DETAIL_2, publisher: null, series: null, volume: null },
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const IDS = COMIC_BOOKS.map(comic => comic.comicId);
  const PAGE_INDEX = 22;
  const USER = USER_READER;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: {
      ...initialComicBookListState,
      comicBooks: COMIC_BOOKS
    },
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  let store: MockStore<any>;
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
                collectionType: CollectionType.CHARACTERS,
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
      spyOn(store, 'dispatch');
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
    const COLLECTION_VOLUME = '1996';

    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: COLLECTION_TYPE,
        collectionName: COLLECTION_NAME,
        volume: COLLECTION_VOLUME
      });
    });

    it('sets the collection type', () => {
      expect(component.collectionType).toEqual(CollectionType.STORIES);
    });

    it('sets the routable type name', () => {
      expect(component.routableTypeName).toEqual(COLLECTION_TYPE);
    });

    it('sets the collection name', () => {
      expect(component.collectionName).toEqual(COLLECTION_NAME);
    });

    it('sets the volume', () => {
      expect(component.volume).toEqual(COLLECTION_VOLUME);
    });

    it('subscribes to comic updates', () => {
      expect(component.comicSubscription).not.toBeNull();
    });

    it('subscribes to selection updates', () => {
      expect(component.selectedSubscription).not.toBeNull();
    });

    describe('when the volume is the null placeholder', () => {
      beforeEach(() => {
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: COLLECTION_TYPE,
          collectionName: COLLECTION_NAME,
          volume: MISSING_VOLUME_PLACEHOLDER
        });
      });

      it('uses the missing volume value', () => {
        expect(component.volume).toEqual('');
      });
    });
  });

  describe('show collections', () => {
    describe('when the collection type is publisher', () => {
      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'publishers',
          collectionName: COMIC_BOOKS[0].publisher
        });
      });

      it('selects comics', () => {
        expect(component.comicBooks).not.toEqual([]);
      });
    });

    describe('when the collection type is series', () => {
      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'series',
          collectionName: COMIC_BOOKS[0].series,
          volume: COMIC_BOOKS[0].volume
        });
      });

      it('selects comics', () => {
        expect(component.comicBooks).not.toEqual([]);
      });
    });

    describe('when the collection type is characters', () => {
      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'characters',
          collectionName: COMIC_BOOKS[0].tags.find(
            entry => entry.type === ComicTagType.CHARACTER
          ).value,
          volume: COMIC_BOOKS[0].volume
        });
      });

      it('selects comics', () => {
        expect(component.comicBooks).not.toEqual([]);
      });
    });

    describe('when the collection type is teams', () => {
      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'teams',
          collectionName: COMIC_BOOKS[0].tags.find(
            entry => entry.type === ComicTagType.TEAM
          ).value,
          volume: COMIC_BOOKS[0].volume
        });
      });

      it('selects comics', () => {
        expect(component.comicBooks).not.toEqual([]);
      });
    });

    describe('when the collection type is locations', () => {
      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'locations',
          collectionName: COMIC_BOOKS[0].tags.find(
            entry => entry.type === ComicTagType.LOCATION
          ).value,
          volume: COMIC_BOOKS[0].volume
        });
      });

      it('selects comics', () => {
        expect(component.comicBooks).not.toEqual([]);
      });
    });

    describe('when the collection type is stories', () => {
      beforeEach(() => {
        component.comicBooks = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'stories',
          collectionName: COMIC_BOOKS[0].tags.find(
            entry => entry.type === ComicTagType.STORY
          ).value,
          volume: COMIC_BOOKS[0].volume
        });
      });

      it('selects comics', () => {
        expect(component.comicBooks).not.toEqual([]);
      });
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_BOOKS;
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
});
