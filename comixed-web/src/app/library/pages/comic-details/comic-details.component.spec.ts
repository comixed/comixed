/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { ComicDetailsComponent } from './comic-details.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  COMIC_FEATURE_KEY,
  initialState as initialComicState
} from '@app/library/reducers/comic.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { COMIC_1, COMIC_2 } from '@app/library/library.fixtures';
import { ComicOverviewComponent } from '@app/library/components/comic-overview/comic-overview.component';
import { ComicStoryComponent } from '@app/library/components/comic-story/comic-story.component';
import { ComicPagesComponent } from '@app/library/components/comic-pages/comic-pages.component';
import { ComicEditComponent } from '@app/library/components/comic-edit/comic-edit.component';
import { BehaviorSubject } from 'rxjs';
import { QUERY_PARAM_TAB } from '@app/library/library.constants';
import { ConfirmationService } from '@app/core';

describe('ComicDetailsComponent', () => {
  const COMIC = COMIC_1;
  const OTHER_COMIC = COMIC_2;
  const initialState = {
    [COMIC_FEATURE_KEY]: initialComicState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: ComicDetailsComponent;
  let fixture: ComponentFixture<ComicDetailsComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComicDetailsComponent,
        ComicOverviewComponent,
        ComicStoryComponent,
        ComicPagesComponent,
        ComicEditComponent
      ],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            params: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        },
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('going to the previous comic in a series', () => {
    beforeEach(() => {
      component.comic = { ...COMIC, previousIssueId: OTHER_COMIC.id };
      component.onPreviousComic();
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith(
        ['library', OTHER_COMIC.id],
        { queryParamsHandling: 'preserve' }
      );
    });
  });

  describe('going to the next comic in a series', () => {
    beforeEach(() => {
      component.comic = { ...COMIC, nextIssueId: OTHER_COMIC.id };
      component.onNextComic();
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith(
        ['library', OTHER_COMIC.id],
        { queryParamsHandling: 'preserve' }
      );
    });
  });

  describe('query parameter processing', () => {
    const TAB = 3;

    it('loads the tab from the URL', () => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_TAB]: `${TAB}`
      });
      expect(component.currentTab).toEqual(TAB);
    });

    it('updates the URL when the tab changes', () => {
      component.onTabChange(TAB);
      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
