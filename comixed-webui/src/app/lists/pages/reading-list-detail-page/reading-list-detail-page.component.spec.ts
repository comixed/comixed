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
import { ReadingListDetailPageComponent } from './reading-list-detail-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialReadingListDetailsState,
  READING_LIST_DETAIL_FEATURE_KEY
} from '@app/lists/reducers/reading-list-detail.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  createReadingList,
  loadReadingList,
  readingListLoaded,
  saveReadingList
} from '@app/lists/actions/reading-list-detail.actions';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5,
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { removeSelectedComicBooksFromReadingList } from '@app/lists/actions/reading-list-entries.actions';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import {
  READING_LIST_REMOVAL_TOPIC,
  READING_LIST_UPDATES_TOPIC
} from '@app/lists/lists.constants';
import { interpolate, PAGE_SIZE_DEFAULT } from '@app/core';
import {
  DOWNLOAD_READING_LIST_FEATURE_KEY,
  initialState as initialDownloadReadingListState
} from '@app/lists/reducers/download-reading-list.reducer';
import { downloadReadingList } from '@app/lists/actions/download-reading-list.actions';
import { deleteReadingLists } from '@app/lists/actions/reading-lists.actions';
import { TitleService } from '@app/core/services/title.service';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { ComicListViewComponent } from '@app/comic-books/components/comic-list-view/comic-list-view.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import { setMultipleComicBookByIdSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';
import {
  initialState as initialLibraryPluginState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import {
  initialState as initialReadComicBooksState,
  READ_COMIC_BOOKS_FEATURE_KEY
} from '@app/user/reducers/read-comic-books.reducer';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import { loadComicsForReadingList } from '@app/comic-books/actions/comic-list.actions';

describe('ReadingListDetailPageComponent', () => {
  const READING_LIST = {
    ...READING_LIST_3,
    entries: [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5]
  };
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_5
  ];
  const initialState = {
    [READING_LIST_DETAIL_FEATURE_KEY]: initialReadingListDetailsState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [DOWNLOAD_READING_LIST_FEATURE_KEY]: initialDownloadReadingListState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [USER_FEATURE_KEY]: initialUserState,
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState,
    [READ_COMIC_BOOKS_FEATURE_KEY]: initialReadComicBooksState
  };

  let component: ReadingListDetailPageComponent;
  let fixture: ComponentFixture<ReadingListDetailPageComponent>;
  let store: MockStore<any>;
  let dispatchSpy: jasmine.Spy;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let confirmationService: ConfirmationService;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let titleService: TitleService;
  let translateService: TranslateService;

  const updateSubscription = jasmine.createSpyObj(['unsubscribe']);
  updateSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe(updates)'
  );
  const removalSubscription = jasmine.createSpyObj(['unsubscribe']);
  removalSubscription.unsubscribe = jasmine.createSpy(
    'Subscription.unsubscribe(removals)'
  );

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ReadingListDetailPageComponent,
          ComicListViewComponent,
          ComicCoverUrlPipe,
          ComicTitlePipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule,
          MatToolbarModule,
          MatIconModule,
          MatTooltipModule,
          MatFormFieldModule,
          MatTableModule,
          MatSortModule,
          MatPaginatorModule,
          MatIconModule,
          MatCardModule,
          MatMenuModule,
          MatInputModule,
          MatCheckboxModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject<{}>({
                id: READING_LIST.readingListId
              }),
              queryParams: new BehaviorSubject<{}>({}),
              snapshot: {} as ActivatedRouteSnapshot
            }
          },
          ConfirmationService,
          {
            provide: WebSocketService,
            useValue: {
              subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
              unsubscribe: jasmine.createSpy('WebSocketService.unsubscribe()')
            }
          },
          TitleService,
          QueryParameterService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ReadingListDetailPageComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      dispatchSpy = spyOn(store, 'dispatch');
      activatedRoute = TestBed.inject(ActivatedRoute);
      router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
      spyOn(router, 'navigate');
      confirmationService = TestBed.inject(ConfirmationService);
      webSocketService = TestBed.inject(
        WebSocketService
      ) as jasmine.SpyObj<WebSocketService>;
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      translateService = TestBed.inject(TranslateService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      translateService.use('fr');
    });

    it('loads the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when creating a new reading list', () => {
    beforeEach(() => {
      component.readingListId = 1;
      (activatedRoute.params as BehaviorSubject<{}>).next({});
    });

    it('sets the reading list id', () => {
      expect(component.readingListId).toEqual(-1);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(createReadingList());
    });
  });

  describe('when loading an existing reading list', () => {
    beforeEach(() => {
      component.readingListId = -1;
      (activatedRoute.params as BehaviorSubject<{}>).next({
        id: `${READING_LIST.readingListId}`
      });
    });

    it('sets the reading list id', () => {
      expect(component.readingListId).toEqual(READING_LIST.readingListId);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadReadingList({ id: READING_LIST.readingListId })
      );
    });
  });

  describe('when the reading list was not found', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [READING_LIST_DETAIL_FEATURE_KEY]: {
          ...initialReadingListDetailsState,
          notFound: true
        }
      });
    });

    it('redirects the browser', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/lists/reading/all');
    });
  });

  describe('receiving the reading list', () => {
    describe('after saving a new reading list', () => {
      beforeEach(() => {
        component.readingListId = -1;
        store.setState({
          ...initialState,
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...initialReadingListDetailsState,
            notFound: false,
            list: READING_LIST
          }
        });
      });

      it('redirects the browser', () => {
        expect(router.navigate).toHaveBeenCalledWith([
          '/lists',
          'reading',
          READING_LIST.readingListId
        ]);
      });
    });

    describe('when loading an existing reading list', () => {
      beforeEach(() => {
        component.dataSource.data = [];
        component.readingListId = READING_LIST.readingListId;
        dispatchSpy.calls.reset();
        store.setState({
          ...initialState,
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...initialReadingListDetailsState,
            notFound: false,
            list: READING_LIST
          }
        });
      });

      it('sets the reading list', () => {
        expect(component.readingList).toEqual(READING_LIST);
      });

      it('loads the name', () => {
        expect(component.readingListForm.controls.name.value).toEqual(
          READING_LIST.name
        );
      });

      it('loads the summary', () => {
        expect(component.readingListForm.controls.summary.value).toEqual(
          READING_LIST.summary
        );
      });

      it('loads the comics to display', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadComicsForReadingList({
            readingListId: READING_LIST.readingListId,
            pageSize: PAGE_SIZE_DEFAULT,
            pageIndex: 0,
            sortBy: undefined,
            sortDirection: undefined
          })
        );
      });

      describe('receiving the comics to display', () => {
        beforeEach(() => {
          store.setState({
            ...initialState,
            [COMIC_LIST_FEATURE_KEY]: {
              ...initialComicListState,
              comics: COMIC_LIST
            }
          });
        });

        it('loads the table data source', () => {
          expect(component.dataSource.data).not.toEqual([]);
        });
      });
    });
  });

  describe('saving a reading list', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onSave();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveReadingList({ list: READING_LIST })
      );
    });
  });

  describe('undoing changes to a reading list', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      component.readingListForm.controls.name.setValue(
        READING_LIST.name.substr(1)
      );
      component.readingListForm.controls.summary.setValue(
        READING_LIST.summary.substr(1)
      );
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onReset();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('resets the name field', () => {
      expect(component.readingListForm.controls.name.value).toEqual(
        READING_LIST.name
      );
    });

    it('resets the summary field', () => {
      expect(component.readingListForm.controls.summary.value).toEqual(
        READING_LIST.summary
      );
    });
  });

  describe('removing selected entries', () => {
    const SELECTED_IDS = COMIC_LIST.map(entry => entry.comicDetailId);
    beforeEach(() => {
      component.readingList = READING_LIST;
      component.selectedIds = SELECTED_IDS;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onRemoveEntries();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        removeSelectedComicBooksFromReadingList({
          list: READING_LIST
        })
      );
    });
  });

  describe('when messaging is started', () => {
    const EMAIL = 'reader@comixedproject.org';
    const LIST_UPDATES = interpolate(READING_LIST_UPDATES_TOPIC, {
      id: READING_LIST.readingListId,
      email: EMAIL
    });
    const LIST_REMOVALS = interpolate(READING_LIST_REMOVAL_TOPIC, {
      email: EMAIL
    });
    let readingListRemovalSubscription: any;

    beforeEach(() => {
      component.readingListId = READING_LIST.readingListId;
      component.readingListUpdateSubscription = null;
      component.readingListRemovalSubscription = null;
      component.email = EMAIL;
      webSocketService.subscribe
        .withArgs(LIST_UPDATES, jasmine.anything())
        .and.callFake((topic, callback) => {
          callback(READING_LIST);
          return {} as Subscription;
        });
      webSocketService.subscribe
        .withArgs(LIST_REMOVALS, jasmine.anything())
        .and.callFake((topic, callback) => {
          readingListRemovalSubscription = callback;
          return {} as Subscription;
        });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to reading list update topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        LIST_UPDATES,
        jasmine.anything()
      );
    });

    it('subscribes to reading list removal topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        LIST_REMOVALS,
        jasmine.anything()
      );
    });

    it('processes reading list updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        readingListLoaded({ list: READING_LIST })
      );
    });

    it('redirects the browser when the current list was removed', () => {
      readingListRemovalSubscription(READING_LIST);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/lists/reading/all');
    });

    it('ignores when a different list was removed', () => {
      readingListRemovalSubscription({
        ...READING_LIST,
        readingListId: READING_LIST.readingListId + 1
      });
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('when messaging stops', () => {
    let readingListUpdateSubscription: Subscription;
    let readingListRemovalSubscription: Subscription;

    beforeEach(() => {
      readingListUpdateSubscription = jasmine.createSpyObj<Subscription>([
        'unsubscribe'
      ]);
      readingListRemovalSubscription = jasmine.createSpyObj<Subscription>([
        'unsubscribe'
      ]);
      component.readingListUpdateSubscription = readingListUpdateSubscription;
      component.readingListRemovalSubscription = readingListRemovalSubscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from reading list updates', () => {
      expect(readingListUpdateSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('sets the reading list update subscription to null', () => {
      expect(component.readingListUpdateSubscription).toBeNull();
    });

    it('unsubscribes from reading list removals', () => {
      expect(readingListRemovalSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('sets the reading list removal subscription to null', () => {
      expect(component.readingListRemovalSubscription).toBeNull();
    });
  });

  describe('downloading the reading list', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      component.onDownload();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        downloadReadingList({ list: READING_LIST })
      );
    });
  });

  describe('delete reading list', () => {
    beforeEach(() => {
      component.readingList = READING_LIST;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeleteReadingList();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteReadingLists({ lists: [READING_LIST] })
      );
    });
  });

  describe('selecting all comic books', () => {
    const SELECT = Math.random() > 0.5;

    beforeEach(() => {
      component.readingList = READING_LIST;
      component.onSelectAll(SELECT);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setMultipleComicBookByIdSelectionState({
          selected: SELECT,
          comicBookIds: component.selectedIds
        })
      );
    });
  });
});
