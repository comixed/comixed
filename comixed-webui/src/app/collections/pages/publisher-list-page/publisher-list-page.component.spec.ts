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
import { PublisherListPageComponent } from './publisher-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  initialState as initialPublisherState,
  PUBLISHER_FEATURE_KEY
} from '@app/collections/reducers/publisher.reducer';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { PUBLISHER_3 } from '@app/collections/collections.fixtures';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';

describe('PublisherListPageComponent', () => {
  const ENTRY = PUBLISHER_3;

  const initialState = {
    [PUBLISHER_FEATURE_KEY]: initialPublisherState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN }
  };

  let component: PublisherListPageComponent;
  let fixture: ComponentFixture<PublisherListPageComponent>;
  let store: MockStore<any>;
  let storeDispatchSpy: jasmine.Spy;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublisherListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        MatInputModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    storeDispatchSpy = spyOn(store, 'dispatch');
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language is changed', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating the query parameters', () => {
    it('sorts by name by default', () => {
      expect(component.sortBy).toEqual('name');
    });

    it('uses ascending sort', () => {
      expect(component.sortDirection).toEqual('asc');
    });

    describe('sorting by series count', () => {
      beforeEach(() => {
        component.onSortChange('series-count', component.sortDirection);
      });

      it('updates the url', () => {
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });

    describe('using descending sort', () => {
      beforeEach(() => {
        component.onSortChange(component.sortBy, 'desc');
      });

      it('updates the url', () => {
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });

    describe('using no sort', () => {
      beforeEach(() => {
        component.onSortChange(component.sortBy, '');
      });

      it('updates the url', () => {
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });
  });

  describe('sorting the table', () => {
    it('can sort by publisher name', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'name')).toEqual(
        ENTRY.name
      );
    });

    it('can sort by issue count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'issue-count')
      ).toEqual(ENTRY.issueCount);
    });

    it('ignores unknown sorts', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'count')).toEqual(
        ''
      );
    });
  });

  describe('navigating the publisher list', () => {
    const PAGE_INDEX = 10;
    const PAGE_SIZE = 10;

    beforeEach(() => {
      component.pageIndex = PAGE_INDEX - 1;
      component.pageSize = 25;
    });

    describe('changing the page size', () => {
      beforeEach(() => {
        storeDispatchSpy.calls.reset();
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
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });
  });
});
