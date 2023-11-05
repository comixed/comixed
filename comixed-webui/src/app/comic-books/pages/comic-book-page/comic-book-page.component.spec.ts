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
import { Router } from '@angular/router';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  LAST_READ_1
} from '@app/comic-books/comic-books.fixtures';
import { ComicDetailEditComponent } from '@app/comic-books/components/comic-detail-edit/comic-detail-edit.component';
import { ComicStoryComponent } from '@app/comic-books/components/comic-story/comic-story.component';
import { ComicPagesComponent } from '@app/comic-books/components/comic-pages/comic-pages.component';
import { ComicScrapingComponent } from '@app/comic-books/components/comic-scraping/comic-scraping.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  initialState as initialScrapingState,
  SINGLE_BOOK_SCRAPING_FEATURE_KEY
} from '@app/comic-metadata/reducers/single-book-scraping.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import {
  loadVolumeMetadata,
  setChosenMetadataSource
} from '@app/comic-metadata/actions/single-book-scraping.actions';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  COMIC_BOOK_FEATURE_KEY,
  initialState as initialComicBookState
} from '@app/comic-books/reducers/comic-book.reducer';
import {
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/comic-books/reducers/last-read-list.reducer';
import { TitleService } from '@app/core/services/title.service';
import { markSingleComicBookRead } from '@app/comic-books/actions/comic-books-read.actions';
import { updateSingleComicBookMetadata } from '@app/library/actions/update-metadata.actions';
import {
  deleteSingleComicBook,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { Subscription } from 'webstomp-client';
import { COMIC_BOOK_UPDATE_TOPIC } from '@app/comic-books/comic-books.constants';
import { interpolate } from '@app/core';
import {
  comicBookLoaded,
  savePageOrder
} from '@app/comic-books/actions/comic-book.actions';
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
import { ComicState } from '@app/comic-books/models/comic-state';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';

describe('ComicBookPageComponent', () => {
  const COMIC_BOOK = COMIC_BOOK_1;
  const IDS = [4, 17, 6];
  const LAST_READ_ENTRY = LAST_READ_1;
  const OTHER_COMIC = COMIC_BOOK_2;
  const USER = USER_READER;
  const SERIES = 'The Series';
  const VOLUME = '2000';
  const ISSUE_NUMBER = '27';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const REFERENCE_ID = `${new Date().getTime()}`;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: { ...initialScrapingState },
    [COMIC_BOOK_FEATURE_KEY]: { ...initialComicBookState },
    [LAST_READ_LIST_FEATURE_KEY]: { ...initialLastReadState },
    [MESSAGING_FEATURE_KEY]: { ...initialMessagingState }
  };

  let component: ComicBookPageComponent;
  let fixture: ComponentFixture<ComicBookPageComponent>;
  let router: Router;
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
          ComicDetailEditComponent,
          ComicStoryComponent,
          ComicPagesComponent,
          ComicScrapingComponent,
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
        component.comicBook = null;
        translateService.use('fr');
      });

      it('does not update the page title', () => {
        expect(titleService.setTitle).not.toHaveBeenCalled();
      });
    });

    describe('with a comic set', () => {
      beforeEach(() => {
        component.comicBook = COMIC_BOOK;
        translateService.use('fr');
      });

      it('updates the page title', () => {
        expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
      });
    });
  });

  describe('when the comic has a metadata source', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [COMIC_BOOK_FEATURE_KEY]: {
          ...initialComicBookState,
          comicBook: {
            ...COMIC_BOOK,
            metadata: {
              metadataSource: METADATA_SOURCE,
              referenceId: REFERENCE_ID
            }
          }
        }
      });
    });

    it('sets the chosen metadata source', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setChosenMetadataSource({ metadataSource: METADATA_SOURCE })
      );
    });
  });

  describe('loading the scraping volumes', () => {
    beforeEach(() => {
      component.metadataSource = METADATA_SOURCE;
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
        loadVolumeMetadata({
          metadataSource: METADATA_SOURCE,
          series: SERIES,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });
  });

  describe('setting the read status', () => {
    beforeEach(() => {
      component.comicBook = COMIC_BOOK;
    });

    describe('marking as read', () => {
      beforeEach(() => {
        component.setReadState(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markSingleComicBookRead({ comicBookId: COMIC_BOOK.id, read: true })
        );
      });
    });

    describe('marking as unread', () => {
      beforeEach(() => {
        component.setReadState(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markSingleComicBookRead({ comicBookId: COMIC_BOOK.id, read: false })
        );
      });
    });
  });

  describe('updating the comic metadata', () => {
    beforeEach(() => {
      component.comicBook = COMIC_BOOK;
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
        updateSingleComicBookMetadata({ comicBookId: COMIC_BOOK.id })
      );
    });
  });

  describe('loading the last read state', () => {
    beforeEach(() => {
      component.comicId = COMIC_BOOK.id;
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
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comicBook = COMIC_BOOK;
    });

    describe('deleting the comic book', () => {
      beforeEach(() => {
        component.onDeleteComicBook(true);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deleteSingleComicBook({ comicBookId: COMIC_BOOK.id })
        );
      });
    });

    describe('undeleting the comic book', () => {
      beforeEach(() => {
        component.onDeleteComicBook(false);
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          undeleteSingleComicBook({ comicBookId: COMIC_BOOK.id })
        );
      });
    });
  });

  describe('subscribing to comic updates', () => {
    beforeEach(() => {
      component.comicId = COMIC_BOOK.id;
      webSocketService.subscribe.and.callFake((topic, callback) => {
        callback(COMIC_BOOK);
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
        interpolate(COMIC_BOOK_UPDATE_TOPIC, { id: COMIC_BOOK.id }),
        jasmine.anything()
      );
    });

    it('publishes updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        comicBookLoaded({ comicBook: COMIC_BOOK })
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

  describe('when the pages are changed', () => {
    beforeEach(() => {
      component.pages = [];
      component.onPagesChanged(COMIC_BOOK.pages);
    });

    it('updates the pages', () => {
      expect(component.pages).toEqual(COMIC_BOOK.pages);
    });
  });

  describe('saving the page order', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comicBook = COMIC_BOOK;
      component.pages = COMIC_BOOK.pages;
      component.onSavePageOrder();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        savePageOrder({
          comicBook: COMIC_BOOK,
          entries: COMIC_BOOK.pages.map((page, index) => {
            return { index, filename: page.filename };
          })
        })
      );
    });
  });

  describe('checking if a comic is deleted', () => {
    beforeEach(() => {
      component.comicBook = COMIC_BOOK;
    });

    it('returns true when the state is DELETED', () => {
      component.comicBook.detail.comicState = ComicState.DELETED;
      expect(component.isDeleted).toBeTrue();
    });

    it('returns true when the state is not DELETED', () => {
      component.comicBook.detail.comicState = ComicState.CHANGED;
      expect(component.isDeleted).toBeFalse();
    });
  });

  describe('checking if a comic has been changes', () => {
    describe('when is has been changed', () => {
      beforeEach(() => {
        component.comicBook = {
          ...COMIC_BOOK,
          detail: { ...COMIC_BOOK.detail, comicState: ComicState.CHANGED }
        };
      });

      it('returns true', () => {
        expect(component.hasChangedState).toBeTrue();
      });
    });

    describe('when is has not been changed', () => {
      beforeEach(() => {
        component.comicBook = {
          ...COMIC_BOOK,
          detail: { ...COMIC_BOOK.detail, comicState: ComicState.STABLE }
        };
      });

      it('returns false', () => {
        expect(component.hasChangedState).toBeFalse();
      });
    });
  });
});
