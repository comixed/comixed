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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoryNameListPageComponent } from './story-name-list-page.component';
import {
  initialState as initialStoryListState,
  STORY_LIST_FEATURE_KEY
} from '@app/lists/reducers/story-list.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { QUERY_PARAM_PAGE_SIZE } from '@app/app.constants';
import { setPagination } from '@app/library/actions/display.actions';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';
import { TitleService } from '@app/core/services/title.service';

describe('StoryNameListPageComponent', () => {
  const NAMES = [STORY_1.name, STORY_2.name, STORY_3.name];
  const initialState = {
    [STORY_LIST_FEATURE_KEY]: { ...initialStoryListState, names: NAMES },
    [DISPLAY_FEATURE_KEY]: { ...initialDisplayState }
  };

  let component: StoryNameListPageComponent;
  let fixture: ComponentFixture<StoryNameListPageComponent>;
  let store: MockStore<any>;
  let dispatchSpy: jasmine.Spy<any>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StoryNameListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTableModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatSortModule
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

    fixture = TestBed.createComponent(StoryNameListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('loads the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('page size', () => {
    const PAGE_SIZE = 25;

    beforeEach(() => {
      component.pageSize = -1;
    });

    describe('when the user preference is different', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [DISPLAY_FEATURE_KEY]: {
            ...initialDisplayState,
            pagination: PAGE_SIZE
          }
        });
      });

      it('sets the page size', () => {
        expect(component.pageSize).toEqual(PAGE_SIZE);
      });
    });

    describe('when provided in the url', () => {
      beforeEach(() => {
        (activatedRoute.queryParams as BehaviorSubject<{}>).next({
          [QUERY_PARAM_PAGE_SIZE]: `${PAGE_SIZE}`
        });
      });

      it('sets the page size', () => {
        expect(component.pageSize).toEqual(PAGE_SIZE);
      });
    });

    describe('when changed', () => {
      beforeEach(() => {
        component.onPageChange({ pageSize: PAGE_SIZE } as any);
      });

      it('updates the url', () => {
        expect(router.navigate).toHaveBeenCalled();
      });

      it('update the user preference', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setPagination({ pagination: PAGE_SIZE })
        );
      });
    });

    describe('when unchanged', () => {
      beforeEach(() => {
        component.pageSize = PAGE_SIZE;
        dispatchSpy.calls.reset();
        component.onPageChange({
          pageSize: PAGE_SIZE,
          pageIndex: 0,
          length: 0
        });
      });

      it('does nothing', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('sorting', () => {
    it('sorts by entry', () => {
      expect(
        component.dataSource.sortingDataAccessor(NAMES[0], 'story-name')
      ).toEqual(NAMES[0]);
    });
  });
});
