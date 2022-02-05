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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicBookPageComponent } from './comic-book-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
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
import { COMIC_1, COMIC_2 } from '@app/comic-books/comic-books.fixtures';
import { ComicOverviewComponent } from '@app/comic-books/components/comic-overview/comic-overview.component';
import { ComicStoryComponent } from '@app/comic-books/components/comic-story/comic-story.component';
import { ComicPagesComponent } from '@app/comic-books/components/comic-pages/comic-pages.component';
import { ComicEditComponent } from '@app/comic-books/components/comic-edit/comic-edit.component';
import { BehaviorSubject } from 'rxjs';
import {
  QUERY_PARAM_PAGES_AS_GRID,
  QUERY_PARAM_TAB
} from '@app/library/library.constants';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  initialState as initialScrapingState,
  SCRAPING_FEATURE_KEY
} from '@app/comic-books/reducers/scraping.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { loadScrapingVolumes } from '@app/comic-books/actions/scraping.actions';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  COMIC_FEATURE_KEY,
  initialState as initialComicState
} from '@app/comic-books/reducers/comic.reducer';
import {
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/last-read/reducers/last-read-list.reducer';
import { TitleService } from '@app/core/services/title.service';
import { setComicsRead } from '@app/last-read/actions/set-comics-read.actions';
import { updateMetadata } from '@app/library/actions/update-metadata.actions';
import { LAST_READ_1 } from '@app/last-read/last-read.fixtures';
import { markComicsDeleted } from '@app/comic-books/actions/mark-comics-deleted.actions';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { Subscription } from 'webstomp-client';
import { COMIC_BOOK_UPDATE_TOPIC } from '@app/comic-books/comic-books.constants';
import { interpolate } from '@app/core';
import {
  comicLoaded,
  savePageOrder
} from '@app/comic-books/actions/comic.actions';
import { ComicPageUrlPipe } from '@app/comic-books/pipes/comic-page-url.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';

describe('ComicBookPageComponent', () => {
  const COMIC = COMIC_1;
  const LAST_READ_ENTRY = LAST_READ_1;
  const OTHER_COMIC = COMIC_2;
  const USER = USER_READER;
  const SERIES = 'The Series';
  const VOLUME = '2000';
  const ISSUE_NUMBER = '27';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [SCRAPING_FEATURE_KEY]: { ...initialScrapingState },
    [COMIC_FEATURE_KEY]: { ...initialComicState },
    [LAST_READ_LIST_FEATURE_KEY]: { ...initialLastReadState },
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let component: ComicBookPageComponent;
  let fixture: ComponentFixture<ComicBookPageComponent>;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let store: MockStore<any>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let confirmationService: ConfirmationService;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ComicBookPageComponent,
          ComicOverviewComponent,
          ComicStoryComponent,
          ComicPagesComponent,
          ComicEditComponent,
          ComicTitlePipe,
          ComicPageUrlPipe
        ],
        imports: [
          NoopAnimationsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          RouterTestingModule,
          MatCardModule,
          MatToolbarModule,
          MatDialogModule,
          MatIconModule,
          MatExpansionModule,
          MatGridListModule,
          MatTabsModule
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
          TitleService,
          {
            provide: WebSocketService,
            useValue: {
              subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
              unsubscribe: jasmine.createSpy('WebSocketService.unsubscribe()')
            }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicBookPageComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      activatedRoute = TestBed.inject(ActivatedRoute);
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      confirmationService = TestBed.inject(ConfirmationService);
      webSocketService = TestBed.inject(
        WebSocketService
      ) as jasmine.SpyObj<WebSocketService>;
      fixture.detectChanges();
    })
  );

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

    it('sets the grid view', () => {
      component.showPagesAsGrid = false;
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_PAGES_AS_GRID]: 'true'
      });
      expect(component.showPagesAsGrid).toBeTrue();
    });

    it('clears the grid view', () => {
      component.showPagesAsGrid = true;
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        [QUERY_PARAM_PAGES_AS_GRID]: 'false'
      });
      expect(component.showPagesAsGrid).toBeFalse();
    });
  });

  describe('loading the scraping volumes', () => {
    beforeEach(() => {
      component.onLoadScrapingVolumes(
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
          series: SERIES,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });
  });

  describe('setting the read status', () => {
    beforeEach(() => {
      component.comic = COMIC;
    });

    describe('marking as read', () => {
      beforeEach(() => {
        component.setReadState(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicsRead({ comics: [COMIC], read: true })
        );
      });
    });

    describe('marking as unread', () => {
      beforeEach(() => {
        component.setReadState(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicsRead({ comics: [COMIC], read: false })
        );
      });
    });
  });

  describe('updating the comic metadata', () => {
    beforeEach(() => {
      component.comic = COMIC;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUpdateMetadata();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateMetadata({ comics: [COMIC] })
      );
    });
  });

  describe('loading the last read state', () => {
    beforeEach(() => {
      component.comicId = COMIC.id;
    });

    describe('when the comic is read', () => {
      beforeEach(() => {
        component.isRead = false;
        component.lastRead = null;
        store.setState({
          ...initialState,
          [LAST_READ_LIST_FEATURE_KEY]: {
            ...initialLastReadState,
            entries: [LAST_READ_ENTRY]
          }
        });
      });

      it('sets the read flag', () => {
        expect(component.isRead).toBeTrue();
      });

      it('sets the last read reference', () => {
        expect(component.lastRead).toEqual(LAST_READ_ENTRY);
      });
    });

    describe('when the comic is not read', () => {
      beforeEach(() => {
        component.isRead = true;
        component.lastRead = LAST_READ_ENTRY;
        store.setState({
          ...initialState,
          [LAST_READ_LIST_FEATURE_KEY]: {
            ...initialLastReadState,
            entries: []
          }
        });
      });

      it('clears the read flag', () => {
        expect(component.isRead).toBeFalse();
      });

      it('clears the last read reference', () => {
        expect(component.lastRead).toBeNull();
      });
    });
  });

  describe('setting the deleted state', () => {
    const DELETED = Math.random() > 0.5;

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comic = COMIC;
      component.onSetComicDeletedState(DELETED);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        markComicsDeleted({ comics: [COMIC], deleted: DELETED })
      );
    });
  });

  describe('subscribing to comic updates', () => {
    beforeEach(() => {
      component.comicId = COMIC.id;
      webSocketService.subscribe.and.callFake((topic, callback) => {
        callback(COMIC);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: {
          ...initialMessagingState,
          started: true
        }
      });
    });

    it('subscribes to the task topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        interpolate(COMIC_BOOK_UPDATE_TOPIC, { id: COMIC.id }),
        jasmine.anything()
      );
    });

    it('publishes updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicLoaded({ comic: COMIC })
      );
    });
  });

  describe('unsubscribing from comic updates', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      component.comicUpdateSubscription = subscription;
      component.messagingStarted = true;
      component.unsubscribeFromUpdates();
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription', () => {
      expect(component.comicUpdateSubscription).toBeNull();
    });
  });

  describe('toggling show pages as grid on', () => {
    beforeEach(() => {
      component.showPagesAsGrid = false;
      component.onTogglePageView();
    });

    it('sets the flag', () => {
      expect(component.showPagesAsGrid).toBeTrue();
    });

    it('updates the URL when the tab changes', () => {
      expect(router.navigate).toHaveBeenCalled();
    });
  });

  describe('toggling show pages as grid off', () => {
    beforeEach(() => {
      component.showPagesAsGrid = true;
      component.onTogglePageView();
    });

    it('sets the flag', () => {
      expect(component.showPagesAsGrid).toBeFalse();
    });

    it('updates the URL when the tab changes', () => {
      expect(router.navigate).toHaveBeenCalled();
    });
  });

  describe('when the pages are changed', () => {
    beforeEach(() => {
      component.pages = [];
      component.onPagesChanged(COMIC.pages);
    });

    it('updates the pages', () => {
      expect(component.pages).toEqual(COMIC.pages);
    });
  });

  describe('saving the page order', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comic = COMIC;
      component.pages = COMIC.pages;
      component.onSavePageOrder();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        savePageOrder({
          comic: COMIC,
          entries: COMIC.pages.map((page, index) => {
            return { index, filename: page.filename };
          })
        })
      );
    });
  });
});
