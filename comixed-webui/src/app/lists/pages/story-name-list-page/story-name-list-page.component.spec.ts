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
import { StoryNameListPageComponent } from './story-name-list-page.component';
import {
  initialState as initialStoryListState,
  STORY_LIST_FEATURE_KEY
} from '@app/lists/reducers/story-list.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';
import { TitleService } from '@app/core/services/title.service';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';

describe('StoryNameListPageComponent', () => {
  const NAMES = [STORY_1.name, STORY_2.name, STORY_3.name];
  const USER = USER_READER;
  const initialState = {
    [STORY_LIST_FEATURE_KEY]: { ...initialStoryListState, names: NAMES },
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: StoryNameListPageComponent;
  let fixture: ComponentFixture<StoryNameListPageComponent>;
  let store: MockStore<any>;
  let dispatchSpy: jasmine.Spy<any>;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(
    waitForAsync(() => {
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
        providers: [provideMockStore({ initialState }), TitleService]
      }).compileComponents();

      fixture = TestBed.createComponent(StoryNameListPageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      dispatchSpy = spyOn(store, 'dispatch');
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
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

  describe('sorting', () => {
    it('sorts by entry', () => {
      expect(
        component.dataSource.sortingDataAccessor(NAMES[0], 'story-name')
      ).toEqual(NAMES[0]);
    });
  });
});
