/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { SeriesListPageComponent } from './series-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  initialState as initialSeriesState,
  SERIES_FEATURE_KEY
} from '@app/collections/reducers/series.reducer';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import {
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_PAGE_INDEX,
  QUERY_PARAM_SORT_BY
} from '@app/library/library.constants';
import { TitleService } from '@app/core/services/title.service';
import { SortableListItem } from '@app/core/models/ui/sortable-list-item';
import { Series } from '@app/collections/models/series';
import { SERIES_1 } from '@app/collections/collections.fixtures';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

describe('SeriesListPageComponent', () => {
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [SERIES_FEATURE_KEY]: initialSeriesState,
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState
  };

  let component: SeriesListPageComponent;
  let fixture: ComponentFixture<SeriesListPageComponent>;
  let store: MockStore<any>;
  let activatedRoute: ActivatedRoute;
  let titleService: TitleService;
  let titleServiceSpy: jasmine.Spy;
  let translateService: TranslateService;
  let urlParameterService: UrlParameterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeriesListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatToolbarModule,
        MatTableModule,
        MatSortModule,
        MatSelectModule,
        MatButtonModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule
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

    fixture = TestBed.createComponent(SeriesListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    activatedRoute = TestBed.inject(ActivatedRoute);
    titleService = TestBed.inject(TitleService);
    titleServiceSpy = spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    urlParameterService = TestBed.inject(UrlParameterService);
    spyOn(urlParameterService, 'updateQueryParam');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('query parameters', () => {
    const SORT_FIELD = 'name';
    const PAGE_INDEX = Math.random() * 100;

    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_SORT_BY]: SORT_FIELD,
        [QUERY_PARAM_PAGE_INDEX]: `${PAGE_INDEX}`
      });
    });

    it('retrieves the sort parameter', () => {
      expect(component.sortBy).toEqual(SORT_FIELD);
    });

    it('retrieves the page index', () => {
      expect(component.pageIndex).toEqual(PAGE_INDEX);
    });
  });

  describe('changing the active language', () => {
    beforeEach(() => {
      titleServiceSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('sorting the table', () => {
    const ENTRY = { sortOrder: 1, item: SERIES_1 } as SortableListItem<Series>;

    it('can sort by publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'publisher')
      ).toEqual(ENTRY.item.publisher);
    });

    it('can sort by series name', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'name')
      ).toEqual(ENTRY.item.name);
    });

    it('can sort by volume', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'volume')
      ).toEqual(ENTRY.item.volume);
    });

    it('can sort by total issues', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'total-issues')
      ).toEqual(ENTRY.item.totalIssues);
    });

    it('can sort by comics in the library', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'in-library')
      ).toEqual(ENTRY.item.inLibrary);
    });
  });

  describe('navigating the series list', () => {
    const PAGE_INDEX = 10;
    const PAGE_SIZE = 10;

    beforeEach(() => {
      component.pageIndex = PAGE_INDEX - 1;
      component.pageSize = 25;
    });

    describe('changing the page size', () => {
      beforeEach(() => {
        component.onPageChange(PAGE_SIZE, PAGE_INDEX, PAGE_INDEX);
      });

      it('updates the saved user preference', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: PAGE_SIZE_PREFERENCE,
            value: `${PAGE_SIZE}`
          })
        );
      });
    });

    describe('changing the page index', () => {
      beforeEach(() => {
        component.pageSize = PAGE_SIZE;
        component.onPageChange(PAGE_SIZE, PAGE_INDEX, PAGE_INDEX - 1);
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });
  });

  describe('updating the query parameters', () => {
    it('sorts by name by default', () => {
      expect(component.sortBy).toEqual('name');
    });

    it('uses ascending sort', () => {
      expect(component.sortDirection).toEqual('asc');
    });

    describe('sorting by publisher', () => {
      beforeEach(() => {
        component.onSortChange('publisher', component.sortDirection);
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });

    describe('sorting by name', () => {
      beforeEach(() => {
        component.onSortChange('name', component.sortDirection);
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });

    describe('sorting by volume', () => {
      beforeEach(() => {
        component.onSortChange('volume', component.sortDirection);
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });

    describe('sorting by total issues', () => {
      beforeEach(() => {
        component.onSortChange('total-issues', component.sortDirection);
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });

    describe('sorting by issues in library', () => {
      beforeEach(() => {
        component.onSortChange('in-library', component.sortDirection);
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });

    describe('using descending sort', () => {
      beforeEach(() => {
        component.onSortChange(component.sortBy, 'desc');
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });

    describe('using no sort', () => {
      beforeEach(() => {
        component.onSortChange(component.sortBy, '');
      });

      it('updates the url', () => {
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });
    });
  });
});
