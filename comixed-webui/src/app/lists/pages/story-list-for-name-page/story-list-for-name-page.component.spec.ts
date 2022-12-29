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
import { StoryListForNamePageComponent } from './story-list-for-name-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialStoryListState,
  STORY_LIST_FEATURE_KEY
} from '@app/lists/reducers/story-list.reducer';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QUERY_PARAM_PAGE_SIZE } from '@app/app.constants';
import { loadStoriesForName } from '@app/lists/actions/story-list.actions';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';
import { USER_READER } from '@app/user/user.fixtures';
import { UrlParameterService } from '@app/core/services/url-parameter.service';

describe('StoryListForNamePageComponent', () => {
  const STORIES = [STORY_1, STORY_2, STORY_3];
  const USER = USER_READER;
  const initialState = {
    [STORY_LIST_FEATURE_KEY]: { ...initialStoryListState, entries: STORIES },
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: StoryListForNamePageComponent;
  let fixture: ComponentFixture<StoryListForNamePageComponent>;
  let store: MockStore<any>;
  let dispatchSpy: jasmine.Spy<any>;
  let activatedRoute: ActivatedRoute;
  let urlParameterService: UrlParameterService;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StoryListForNamePageComponent],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatToolbarModule,
          MatIconModule,
          MatPaginatorModule,
          MatTableModule,
          MatTooltipModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject<{}>({}),
              queryParams: new BehaviorSubject<{}>({}),
              snapshot: {} as ActivatedRouteSnapshot
            }
          },
          TitleService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(StoryListForNamePageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      dispatchSpy = spyOn(store, 'dispatch');
      activatedRoute = TestBed.inject(ActivatedRoute);
      urlParameterService = TestBed.inject(UrlParameterService);
      spyOn(urlParameterService, 'updateQueryParam');
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      translateService = TestBed.inject(TranslateService);
      fixture.detectChanges();
    })
  );

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

  describe('the story name', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        name: STORIES[0].name
      });
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadStoriesForName({ name: STORIES[0].name })
      );
    });
  });

  describe('sorting', () => {
    const STORY = STORIES[0];

    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(STORY, 'story-name')
      ).toEqual(STORY.name);
    });

    it('can sort by publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(STORY, 'publisher')
      ).toEqual(STORY.publisher);
    });

    it('can sort by entry count', () => {
      expect(
        component.dataSource.sortingDataAccessor(STORY, 'entry-count')
      ).toEqual(STORY.entries.length);
    });
  });

  describe('page size', () => {
    const PAGE_SIZE = 25;

    describe('when the user preference is different', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: {
              ...USER,
              preferences: [
                { name: PAGE_SIZE_PREFERENCE, value: `${PAGE_SIZE}` }
              ]
            }
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
        expect(urlParameterService.updateQueryParam).toHaveBeenCalled();
      });

      it('update the user preference', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: PAGE_SIZE_PREFERENCE,
            value: `${PAGE_SIZE}`
          })
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
});
