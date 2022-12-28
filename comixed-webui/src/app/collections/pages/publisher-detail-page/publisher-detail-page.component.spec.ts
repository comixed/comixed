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
import { PublisherDetailPageComponent } from './publisher-detail-page.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PUBLISHER_3,
  SERIES_1,
  SERIES_3,
  SERIES_5
} from '@app/collections/collections.fixtures';
import {
  initialState as initialPublisherState,
  PUBLISHER_FEATURE_KEY
} from '@app/collections/reducers/publisher.reducer';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  PAGE_SIZE_PREFERENCE,
  QUERY_PARAM_SORT_BY,
  QUERY_PARAM_SORT_DIRECTION
} from '@app/library/library.constants';

describe('PublisherDetailPageComponent', () => {
  const initialState = { [PUBLISHER_FEATURE_KEY]: initialPublisherState };
  const PUBLISHER = PUBLISHER_3;
  const DETAIL = [SERIES_1, SERIES_3, SERIES_5];

  let component: PublisherDetailPageComponent;
  let fixture: ComponentFixture<PublisherDetailPageComponent>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let titleService: TitleService;
  let translateService: TranslateService;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublisherDetailPageComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({
              name: PUBLISHER.name
            }),
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherDetailPageComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('query parameters', () => {
    it('sorts by name by default', () => {
      expect(component.sortBy).toEqual('name');
    });

    it('uses ascending order', () => {
      expect(component.sortDirection).toEqual('asc');
    });

    describe('when the query parameter is for volume', () => {
      beforeEach(() => {
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_SORT_BY]: 'volume'
        });
      });

      it('sorts by volume', () => {
        expect(component.sortBy).toEqual('volume');
      });
    });

    describe('when the query parameter is for total issues', () => {
      beforeEach(() => {
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_SORT_BY]: 'total-issues'
        });
      });

      it('sorts by volume', () => {
        expect(component.sortBy).toEqual('total-issues');
      });
    });

    describe('when the query parameter is for issues in library', () => {
      beforeEach(() => {
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_SORT_BY]: 'in-library'
        });
      });

      it('sorts by volume', () => {
        expect(component.sortBy).toEqual('in-library');
      });
    });

    describe('when the query parameter is for descending sort', () => {
      beforeEach(() => {
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_SORT_DIRECTION]: 'desc'
        });
      });

      it('sorts in descending order', () => {
        expect(component.sortDirection).toEqual('desc');
      });
    });
  });

  describe('changing the active language', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading the publisher details', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      store.setState({
        ...initialState,
        [PUBLISHER_FEATURE_KEY]: { ...initialPublisherState, detail: DETAIL }
      });
    });

    it('populates the table data source', () => {
      expect(component.dataSource.data).toEqual(DETAIL);
    });
  });

  describe('sorting data', () => {
    const ENTRY = SERIES_1;

    it('can sort by series', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'series')).toEqual(
        ENTRY.name
      );
    });

    it('can sort by volume', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'volume')).toEqual(
        ENTRY.volume
      );
    });

    it('can sort by total issues', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'total-issues')
      ).toEqual(ENTRY.totalIssues);
    });

    it('can sort by issues in library', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'in-library')
      ).toEqual(ENTRY.inLibrary);
    });

    it('ignores unknown fields', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'in-')).toEqual(
        ''
      );
    });
  });

  describe('changing the page', () => {
    const PAGE_SIZE = 10;
    const PAGE_INDEX = 1;

    describe('the page size changes', () => {
      beforeEach(() => {
        component.pageSize = PAGE_SIZE - 1;
        component.onPageChange(PAGE_SIZE, PAGE_INDEX, PAGE_INDEX);
      });

      it('saves the page size', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: PAGE_SIZE_PREFERENCE,
            value: `${PAGE_SIZE}`
          })
        );
      });
    });

    describe('the page index changes', () => {
      beforeEach(() => {
        component.onPageChange(PAGE_SIZE, PAGE_INDEX, PAGE_INDEX - 1);
      });

      it('updates the url', () => {
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });
  });

  describe('changing the sort options', () => {
    beforeEach(() => {
      component.onSortChange('issue-number', 'asc');
    });

    it('updates the url', () => {
      expect(router.navigateByUrl).toHaveBeenCalled();
    });
  });
});
