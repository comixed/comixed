/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { StoryDetailPageComponent } from './story-detail-page.component';
import {
  COMIC_DETAIL_1,
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { USER_READER } from '@app/user/user.fixtures';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import {
  READING_LISTS_FEATURE_KEY,
  reducer as initialReadingListsState
} from '@app/lists/reducers/reading-lists.reducer';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import {
  initialState as initialLibraryPluginState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComicListViewComponent } from '@app/comic-books/components/comic-list-view/comic-list-view.component';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ArchiveTypePipe } from '@app/library/pipes/archive-type.pipe';
import { CoverDateFilterPipe } from '@app/comic-books/pipes/cover-date-filter.pipe';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BehaviorSubject } from 'rxjs';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import {
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_PAGE_SIZE,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION
} from '@app/core';
import { loadComicsForCollection } from '@app/comic-books/actions/comic-list.actions';
import { setMultipleComicBooksByTagTypeAndValueSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { StoryScrapingComponent } from '@app/collections/components/story-scraping/story-scraping.component';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { SCRAPE_STORY_PARAMETER } from '@app/collections/collections.constants';

describe('StoryDetailPageComponent', () => {
  const PAGE_SIZE = 10;
  const PAGE_INDEX = 5;
  const SORT_BY = 'added-date';
  const SORT_DIRECTION = 'asc';
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    { ...DISPLAYABLE_COMIC_2, publisher: null, series: null, volume: null },
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const USER = USER_READER;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [COMIC_LIST_FEATURE_KEY]: {
      ...initialComicListState,
      comicBooks: COMIC_LIST
    },
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginState
  };

  let component: StoryDetailPageComponent;
  let fixture: ComponentFixture<StoryDetailPageComponent>;
  let store: MockStore<any>;
  let storeDispatch: jasmine.Spy;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let titleService: TitleService;
  let translateService: TranslateService;
  let queryParameterService: QueryParameterService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          StoryDetailPageComponent,
          StoryScrapingComponent,
          ComicListViewComponent,
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
                collectionType: ComicTagType.CHARACTER,
                collectionName: 'Batman'
              }),
              queryParams: new BehaviorSubject<{}>({}),
              snapshot: {} as ActivatedRouteSnapshot
            }
          },
          TitleService,
          QueryParameterService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(StoryDetailPageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      storeDispatch = spyOn(store, 'dispatch');
      activatedRoute = TestBed.inject(ActivatedRoute);
      router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      translateService = TestBed.inject(TranslateService);
      queryParameterService = TestBed.inject(QueryParameterService);
      spyOn(queryParameterService, 'updateQueryParam');
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

  describe('when the collection details are received', () => {
    const COLLECTION_TYPE = 'stories';
    const COLLECTION_NAME = 'The Collection';

    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        storyName: COLLECTION_NAME
      });
    });

    it('sets the collection name', () => {
      expect(component.storyName).toEqual(COLLECTION_NAME);
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

    describe('selecting all comics', () => {
      const STORY_NAME = COMIC_DETAIL_1.tags.find(
        entry => entry.type === ComicTagType.STORY
      ).value;

      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          storyName: STORY_NAME,
          volume: COMIC_DETAIL_1.volume
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicsForCollection({
            pageSize: PAGE_SIZE,
            pageIndex: PAGE_INDEX,
            tagType: ComicTagType.STORY,
            tagValue: STORY_NAME,
            sortBy: SORT_BY,
            sortDirection: SORT_DIRECTION
          })
        );
      });
    });
  });

  describe('selecting all comic books', () => {
    const SELECT = Math.random() > 0.5;
    const TAG_TYPE = ComicTagType.STORY;
    const STORY_NAME = 'Wakanda';

    beforeEach(() => {
      component.storyName = STORY_NAME;
      component.onSelectAll(SELECT);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setMultipleComicBooksByTagTypeAndValueSelectionState({
          selected: SELECT,
          tagType: TAG_TYPE,
          tagValue: STORY_NAME
        })
      );
    });
  });

  describe('scraping the story', () => {
    beforeEach(() => {
      component.onShowStoryScraping();
    });

    it('updates the query parameters', () => {
      expect(queryParameterService.updateQueryParam).toHaveBeenCalledWith([
        {
          name: SCRAPE_STORY_PARAMETER,
          value: `${true}`
        }
      ]);
    });
  });
});
