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
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { ConfirmationService, TitleService } from '@app/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { MatDialogRef } from '@angular/material/dialog';
import {
  initialState as initialScrapingState,
  SCRAPING_FEATURE_KEY
} from '@app/library/reducers/scraping.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { loadScrapingVolumes } from '@app/library/actions/scraping.actions';
import { ComicTitlePipe } from '@app/library/pipes/comic-title.pipe';
import {
  COMIC_FEATURE_KEY,
  initialState as initialComicState
} from '@app/library/reducers/comic.reducer';

describe('ComicDetailsComponent', () => {
  const COMIC = COMIC_1;
  const OTHER_COMIC = COMIC_2;
  const USER = USER_READER;
  const API_KEY = '1234567890ABCDEF';
  const SERIES = 'The Series';
  const VOLUME = '2000';
  const ISSUE_NUMBER = '27';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [DISPLAY_FEATURE_KEY]: { ...initialDisplayState },
    [SCRAPING_FEATURE_KEY]: { ...initialScrapingState },
    [COMIC_FEATURE_KEY]: { ...initialComicState }
  };

  let component: ComicDetailsComponent;
  let fixture: ComponentFixture<ComicDetailsComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;

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
        RouterTestingModule,
        MatCardModule,
        MatToolbarModule
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
        {
          provide: MatDialogRef,
          useValue: {}
        },
        ConfirmationService,
        ComicTitlePipe,
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    activatedRoute = TestBed.inject(ActivatedRoute);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    describe('without a comic set', () => {
      beforeEach(() => {
        component.comic = null;
        translateService.use('fr');
      });

      it('does not update the page title', () => {
        expect(titleService.setTitle).not.toHaveBeenCalled();
      });
    });
    describe('with a comic set', () => {
      beforeEach(() => {
        component.comic = COMIC;
        translateService.use('fr');
      });

      it('updates the page title', () => {
        expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
      });
    });
  });

  describe('going to the previous comic in a series', () => {
    beforeEach(() => {
      component.comic = { ...COMIC, previousIssueId: OTHER_COMIC.id };
      component.onPreviousComic();
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith(
        ['library', 'comics', OTHER_COMIC.id],
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
        ['library', 'comics', OTHER_COMIC.id],
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

  describe('loading the scraping volumes', () => {
    beforeEach(() => {
      component.onLoadScrapingVolumes(
        API_KEY,
        SERIES,
        VOLUME,
        ISSUE_NUMBER,
        MAXIMUM_RECORDS,
        SKIP_CACHE
      );
    });

    it('holds the series name', () => {
      expect(component.scrapingSeriesName).toEqual(SERIES);
    });

    it('holds the volume', () => {
      expect(component.scrapingVolume).toEqual(VOLUME);
    });

    it('holds the issue number', () => {
      expect(component.scrapingIssueNumber).toEqual(ISSUE_NUMBER);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadScrapingVolumes({
          apiKey: API_KEY,
          series: SERIES,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });
  });
});
