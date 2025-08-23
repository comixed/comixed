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
import { DuplicatePageListPageComponent } from './duplicate-page-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DUPLICATE_PAGE_LIST_FEATURE_KEY,
  initialState as initialDuplicatePageListState
} from '@app/library/reducers/duplicate-page-list.reducer';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { WebSocketService } from '@app/messaging';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';
import {
  DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
  DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY
} from '@app/library/library.constants';
import {
  duplicatePageRemoved,
  duplicatePageUpdated
} from '@app/library/actions/duplicate-page-list.actions';
import { TitleService } from '@app/core/services/title.service';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_2,
  BLOCKED_HASH_3,
  BLOCKED_HASH_4,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageHashUrlPipe } from '@app/comic-books/pipes/page-hash-url.pipe';
import { YesNoPipe } from '@app/core/pipes/yes-no.pipe';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatSortModule, SortDirection } from '@angular/material/sort';
import {
  BLOCKED_HASHES_FEATURE_KEY,
  initialState as initialBlockedHashesState
} from '@app/comic-pages/reducers/blocked-hashes.reducer';
import {
  setBlockedStateForHash,
  setBlockedStateForSelectedHashes
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { RouterTestingModule } from '@angular/router/testing';
import { PAGE_SIZE_DEFAULT } from '@app/core';
import { DuplicatePageUpdate } from '@app/library/models/net/duplicate-page-update';
import {
  HASH_SELECTION_FEATURE_KEY,
  initialState as initialHashSelectionState
} from '@app/comic-pages/reducers/hash-selection.reducer';
import {
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  removeHashSelection
} from '@app/comic-pages/actions/hash-selection.actions';

describe('DuplicatePageListPageComponent', () => {
  const COMICS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const DUPLICATE_PAGES = [
    DUPLICATE_PAGE_1,
    DUPLICATE_PAGE_2,
    DUPLICATE_PAGE_3
  ];
  const BLOCKED_PAGE = { ...DUPLICATE_PAGES[0], hash: BLOCKED_HASH_1.hash };
  const NON_BLOCKED_PAGE = {
    ...DUPLICATE_PAGES[0],
    hash: BLOCKED_HASH_1.hash.substring(1)
  };
  const BLOCKED_HASHES = [
    BLOCKED_HASH_1,
    BLOCKED_HASH_2,
    BLOCKED_HASH_3,
    BLOCKED_HASH_4,
    BLOCKED_HASH_5
  ];
  const TOTAL_PAGES = DUPLICATE_PAGES.length;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [DUPLICATE_PAGE_LIST_FEATURE_KEY]: initialDuplicatePageListState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [BLOCKED_HASHES_FEATURE_KEY]: initialBlockedHashesState,
    [HASH_SELECTION_FEATURE_KEY]: initialHashSelectionState
  };

  let component: DuplicatePageListPageComponent;
  let fixture: ComponentFixture<DuplicatePageListPageComponent>;
  let store: MockStore<any>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy<any>;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;
  let queryParameterService: QueryParameterService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatIconModule,
        MatPaginatorModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        DuplicatePageListPageComponent,
        PageHashUrlPipe,
        YesNoPipe
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            subscribe: jasmine.createSpy('WebSocketService.subscribe()'),
            send: jasmine.createSpy('WebSocketService.send()'),
            requestResponse: jasmine.createSpy(
              'WebSocketService.requestResponse()'
            )
          }
        },
        ConfirmationService,
        {
          provide: QueryParameterService,
          useValue: {
            pageSize$: new BehaviorSubject<number>(PAGE_SIZE_DEFAULT),
            pageIndex$: new BehaviorSubject<number>(0),
            sortBy$: new BehaviorSubject<string>(null),
            sortDirection$: new BehaviorSubject<SortDirection>('')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicatePageListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    titleService = TestBed.inject(TitleService);
    setTitleSpy = spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    confirmationService = TestBed.inject(ConfirmationService);
    component.pageUpdatesSubscription = null;
    queryParameterService = TestBed.inject(QueryParameterService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when duplicate page updates are subscribed', () => {
    let subscription: any;

    beforeEach(() => {
      subscription = jasmine.createSpyObj(['unsubscribe']);
      component.pageUpdatesSubscription = subscription;
      component.ngOnDestroy();
    });

    it('unsubscribes from duplicate page updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the reference', () => {
      expect(component.pageUpdatesSubscription).toBeNull();
    });
  });

  it('loads the page title', () => {
    expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('reloads the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when messaging starts', () => {
    describe('receiving updates', () => {
      const UPDATE = {
        page: DUPLICATE_PAGES[0],
        removed: false,
        total: TOTAL_PAGES
      } as DuplicatePageUpdate;

      beforeEach(() => {
        component.pageUpdatesSubscription = null;
        webSocketService.subscribe
          .withArgs(DUPLICATE_PAGE_LIST_UPDATE_TOPIC, jasmine.anything())
          .and.callFake((topic, callback) => {
            callback(UPDATE);
            return {} as Subscription;
          });
        store.setState({
          ...initialState,
          [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
        });
      });

      it('subscribes to duplicate page list updates', () => {
        expect(webSocketService.subscribe).toHaveBeenCalledWith(
          DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
          jasmine.anything()
        );
      });

      it('processes duplicate page list updates', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          duplicatePageUpdated({
            page: UPDATE.page,
            total: UPDATE.total
          })
        );
      });
    });

    describe('receiving removals', () => {
      const UPDATE = {
        page: DUPLICATE_PAGES[0],
        removed: true,
        total: TOTAL_PAGES
      } as DuplicatePageUpdate;

      beforeEach(() => {
        component.pageUpdatesSubscription = null;
        webSocketService.subscribe
          .withArgs(DUPLICATE_PAGE_LIST_UPDATE_TOPIC, jasmine.anything())
          .and.callFake((topic, callback) => {
            callback(UPDATE);
            return {} as Subscription;
          });
        store.setState({
          ...initialState,
          [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
        });
      });

      it('subscribes to duplicate page list updates', () => {
        expect(webSocketService.subscribe).toHaveBeenCalledWith(
          DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
          jasmine.anything()
        );
      });

      it('processes duplicate page list updates', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          duplicatePageRemoved({
            page: UPDATE.page,
            total: UPDATE.total
          })
        );
      });
    });
  });

  describe('blocking a duplicate page', () => {
    const ENTRY = {
      item: DUPLICATE_PAGES[0],
      selected: Math.random() > 0.5
    } as SelectableListItem<DuplicatePage>;

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onBlockPage(ENTRY);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setBlockedStateForHash({ hashes: [ENTRY.item.hash], blocked: true })
      );
    });
  });

  describe('unblocking a duplicate page', () => {
    const ENTRY = {
      item: DUPLICATE_PAGES[0],
      selected: Math.random() > 0.5
    } as SelectableListItem<DuplicatePage>;

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUnblockPage(ENTRY);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setBlockedStateForHash({ hashes: [ENTRY.item.hash], blocked: false })
      );
    });
  });

  describe('selections', () => {
    const PAGE = DUPLICATE_PAGES[0];

    beforeEach(() => {
      component.selectedHashes = [DUPLICATE_PAGES[0].hash];
      component.duplicatePages = DUPLICATE_PAGES;
    });

    describe('selecting an element', () => {
      beforeEach(() => {
        component.onSelectOne(
          { item: PAGE } as SelectableListItem<DuplicatePage>,
          true
        );
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          addHashSelection({ hash: PAGE.hash })
        );
      });
    });

    describe('deselecting an element', () => {
      beforeEach(() => {
        component.onSelectOne(
          { item: PAGE } as SelectableListItem<DuplicatePage>,
          false
        );
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          removeHashSelection({ hash: PAGE.hash })
        );
      });
    });

    describe('selecting all elements', () => {
      beforeEach(() => {
        component.onSelectAll(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(addAllHashesToSelection());
      });
    });

    describe('deselecting all elements', () => {
      beforeEach(() => {
        component.onSelectAll(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(clearHashSelections());
      });
    });
  });

  describe('blocking selected hashes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onBlockSelected();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setBlockedStateForSelectedHashes({ blocked: true })
      );
    });
  });

  describe('blocking selected hashes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUnblockSelected();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setBlockedStateForSelectedHashes({ blocked: false })
      );
    });
  });

  describe('when messaging starts', () => {
    const DUPLICATE_PAGE = DUPLICATE_PAGES[0];

    beforeEach(() => {
      webSocketService.subscribe.and.callFake((destination, callback) => {
        callback({
          page: DUPLICATE_PAGE,
          removed: false,
          total: TOTAL_PAGES
        } as DuplicatePageUpdate);
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to the update topic', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        DUPLICATE_PAGE_LIST_UPDATE_TOPIC,
        jasmine.anything()
      );
    });

    it('processes duplicate page list updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        duplicatePageUpdated({
          page: DUPLICATE_PAGE,
          total: TOTAL_PAGES
        })
      );
    });
  });

  describe('the unblocked only flag', () => {
    beforeEach(() => {
      component.blockedHashList = BLOCKED_HASHES;
      component.duplicatePages = DUPLICATE_PAGES;
    });

    describe('when unblocked only is off', () => {
      beforeEach(() => {
        component.unblockedOnly = false;
      });

      it('shows all entries', () => {
        expect(
          component.dataSource.data.every(entry =>
            BLOCKED_HASHES.map(hash => hash.hash).includes(entry.item.hash)
          )
        ).not.toBeTrue();
      });
    });

    describe('when unblocked only is on', () => {
      beforeEach(() => {
        component.unblockedOnly = true;
      });

      it('only shows unblocked entries', () => {
        console.log('*** data:', component.dataSource.data);
        console.log('*** hashes:', component.blockedHashList);
        expect(
          component.dataSource.data.some(entry =>
            BLOCKED_HASHES.map(hash => hash.hash).includes(entry.item.hash)
          )
        ).not.toBeTrue();
      });
    });

    describe('toggling the unblocked only flag on', () => {
      beforeEach(() => {
        component.onToggleUnblockedOnly();
      });

      it('saves the user preference', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({
            name: DUPLICATE_PAGES_UNBLOCKED_PAGES_ONLY,
            value: `${true}`
          })
        );
      });
    });
  });

  describe('getting the selected count', () => {
    beforeEach(() => {
      component.selectedHashes = DUPLICATE_PAGES.map(entry => entry.hash);
    });

    it('returns the selected count', () => {
      expect(component.selectedCount).toEqual(DUPLICATE_PAGES.length);
    });
  });

  describe('blocked hashes', () => {
    beforeEach(() => {
      component.blockedHashList = BLOCKED_HASHES;
    });

    it('identifies a blocked hash', () => {
      expect(
        component.isBlocked({
          item: BLOCKED_PAGE
        } as SelectableListItem<DuplicatePage>)
      ).toBeTrue();
    });

    it('identifies a non-blocked hash', () => {
      expect(
        component.isBlocked({
          item: NON_BLOCKED_PAGE
        } as SelectableListItem<DuplicatePage>)
      ).toBeFalse();
    });
  });

  describe('showing the page popup', () => {
    const DUPLICATE_PAGE = DUPLICATE_PAGES[0];

    beforeEach(() => {
      component.showPopup = false;
      component.popupPage = null;
      component.onShowPagePopup(true, DUPLICATE_PAGE);
    });

    it('shows the popup', () => {
      expect(component.showPopup).toBeTrue();
    });

    it('sets the page the show', () => {
      expect(component.popupPage).toBe(DUPLICATE_PAGE);
    });

    describe('hiding the popup', () => {
      beforeEach(() => {
        component.onShowPagePopup(false, null);
      });

      it('hides the popup', () => {
        expect(component.showPopup).toBeFalse();
      });

      it('clears the page the show', () => {
        expect(component.popupPage).toBeNull();
      });
    });
  });
});
