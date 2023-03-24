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
import { loadStoriesForName } from '@app/lists/actions/story-list.actions';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatSortModule } from '@angular/material/sort';

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
          MatTooltipModule,
          MatSortModule
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
});
