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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublisherIssuesPageComponent } from './publisher-issues-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComicDetailListViewComponent } from '@app/comic-books/components/comic-detail-list-view/comic-detail-list-view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  initialState as initialComicDetailListState
} from '@app/comic-books/reducers/comic-details-list.reducer';
import { PAGE_SIZE_DEFAULT, QUERY_PARAM_PAGE_INDEX } from '@app/core';
import { loadComicDetails } from '@app/comic-books/actions/comic-details-list.actions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import { setMultipleComicBookByPublisherSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { TitleService } from '@app/core/services/title.service';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';

describe('PublisherIssuesComponent', () => {
  const PUBLISHER_NAME = 'The Publisher';
  const initialState = {
    [COMIC_DETAILS_LIST_FEATURE_KEY]: initialComicDetailListState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: PublisherIssuesPageComponent;
  let fixture: ComponentFixture<PublisherIssuesPageComponent>;
  let store: MockStore;
  let storeDispatchSpy: jasmine.Spy;
  let queryParameterService: QueryParameterService;
  let activatedRoute: ActivatedRoute;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PublisherIssuesPageComponent,
        ComicDetailListViewComponent
      ],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatPaginatorModule,
        MatMenuModule,
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        MatFormFieldModule
      ],
      providers: [
        provideMockStore({ initialState }),
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
            sortDirection$: new BehaviorSubject<ComicType>(null),
            updateQueryParam: jasmine.createSpy(
              'QueryParameterService.updateQueryParam()'
            )
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({ name: PUBLISHER_NAME }),
            queryParams: new BehaviorSubject<{}>({})
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherIssuesPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = spyOn(store, 'dispatch');
    queryParameterService = TestBed.inject(QueryParameterService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the query parameters update', () => {
    const PAGE_NUMBER = 12;

    beforeEach(() => {
      storeDispatchSpy.calls.reset();
      (queryParameterService.pageIndex$ as BehaviorSubject<{}>).next(
        PAGE_NUMBER
      );
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_PAGE_INDEX]: PAGE_NUMBER
      });
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadComicDetails({
          pageSize: PAGE_SIZE_DEFAULT,
          pageIndex: PAGE_NUMBER,
          sortBy: null,
          sortDirection: null,
          coverYear: null,
          coverMonth: null,
          archiveType: null,
          comicType: null,
          comicState: null,
          selected: false,
          unscrapedState: false,
          searchText: null,
          publisher: PUBLISHER_NAME,
          series: null,
          volume: null
        })
      );
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.name = PUBLISHER_NAME;
    });

    describe('selecting all', () => {
      beforeEach(() => {
        component.onSelectAll(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setMultipleComicBookByPublisherSelectionState({
            publisher: PUBLISHER_NAME,
            selected: true
          })
        );
      });
    });

    describe('deselecting all', () => {
      beforeEach(() => {
        component.onSelectAll(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setMultipleComicBookByPublisherSelectionState({
            publisher: PUBLISHER_NAME,
            selected: false
          })
        );
      });
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
