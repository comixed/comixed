/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { SeriesIssuePageComponent } from './series-issue-page.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ActivatedRoute } from '@angular/router';
import { ComicListViewComponent } from '@app/comic-books/components/comic-list-view/comic-list-view.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BehaviorSubject } from 'rxjs';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { PAGE_SIZE_DEFAULT, QUERY_PARAM_PAGE_INDEX } from '@app/core';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import { setMultipleComicBookByPublisherSeriesAndVolumeSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import { TitleService } from '@app/core/services/title.service';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { loadComicsByFilter } from '@app/comic-books/actions/comic-list.actions';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';

describe('SeriesIssuePageComponent', () => {
  const PUBLISHER_NAME = 'The Publisher';
  const SERIES_NAME = 'The Series';
  const VOLUME = '2024';
  const initialState = {
    [COMIC_LIST_FEATURE_KEY]: initialComicListState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: SeriesIssuePageComponent;
  let fixture: ComponentFixture<SeriesIssuePageComponent>;
  let store: MockStore;
  let storeDispatchSpy: jasmine.Spy;
  let queryParameterService: QueryParameterService;
  let activatedRoute: ActivatedRoute;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatPaginatorModule,
        MatMenuModule,
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        MatFormFieldModule,
        SeriesIssuePageComponent,
        ComicListViewComponent
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
            params: new BehaviorSubject<{}>({
              publisher: PUBLISHER_NAME,
              name: SERIES_NAME,
              volume: VOLUME
            }),
            queryParams: new BehaviorSubject<{}>({})
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesIssuePageComponent);
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
        loadComicsByFilter({
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
          series: SERIES_NAME,
          volume: VOLUME,
          pageCount: null
        })
      );
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.publisherName = PUBLISHER_NAME;
      component.seriesName = SERIES_NAME;
      component.volume = VOLUME;
    });

    describe('selecting all', () => {
      beforeEach(() => {
        component.onSelectAll(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setMultipleComicBookByPublisherSeriesAndVolumeSelectionState({
            publisher: PUBLISHER_NAME,
            series: SERIES_NAME,
            volume: VOLUME,
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
          setMultipleComicBookByPublisherSeriesAndVolumeSelectionState({
            publisher: PUBLISHER_NAME,
            series: SERIES_NAME,
            volume: VOLUME,
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
