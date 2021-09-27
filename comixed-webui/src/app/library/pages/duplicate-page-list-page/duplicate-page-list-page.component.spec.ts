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
import { DuplicatePageListPageComponent } from './duplicate-page-list-page.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoggerModule } from '@angular-ru/logger';
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
import { Subscription } from 'webstomp-client';
import {
  DUPLICATE_PAGE_1,
  DUPLICATE_PAGE_2,
  DUPLICATE_PAGE_3
} from '@app/library/library.fixtures';
import { DUPLICATE_PAGE_LIST_TOPIC } from '@app/library/library.constants';
import { duplicatePagesLoaded } from '@app/library/actions/duplicate-page-list.actions';
import { TitleService } from '@app/core/services/title.service';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import { ComicsWithDuplicatePageComponent } from '@app/library/components/comics-with-duplicate-page/comics-with-duplicate-page.component';
import { setBlockedState } from '@app/comic-pages/actions/block-page.actions';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import {
  BLOCKED_HASH_LIST_FEATURE_KEY,
  initialState as initialBlockedPageListState
} from '@app/comic-pages/reducers/blocked-hash-list.reducer';
import { BLOCKED_HASH_1 } from '@app/comic-pages/comic-pages.fixtures';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageHashUrlPipe } from '@app/comic-book/pipes/page-hash-url.pipe';
import { YesNoPipe } from '@app/core/pipes/yes-no.pipe';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DuplicatePageListPageComponent', () => {
  const DUPLICATE_PAGES = [
    DUPLICATE_PAGE_1,
    DUPLICATE_PAGE_2,
    DUPLICATE_PAGE_3
  ];
  const initialState = {
    [DUPLICATE_PAGE_LIST_FEATURE_KEY]: initialDuplicatePageListState,
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [BLOCKED_HASH_LIST_FEATURE_KEY]: initialBlockedPageListState
  };

  let component: DuplicatePageListPageComponent;
  let fixture: ComponentFixture<DuplicatePageListPageComponent>;
  let store: MockStore<any>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let titleService: TitleService;
  let setTitleSpy: jasmine.Spy<any>;
  let translateService: TranslateService;
  let dialog: MatDialog;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DuplicatePageListPageComponent,
        PageHashUrlPipe,
        YesNoPipe
      ],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatIconModule,
        MatPaginatorModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatTableModule,
        MatCheckboxModule
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
        ConfirmationService
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
    dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');
    confirmationService = TestBed.inject(ConfirmationService);
    component.pageUpdatesSubscription = null;
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
    beforeEach(() => {
      component.pageUpdatesSubscription = null;
      webSocketService.subscribe
        .withArgs(DUPLICATE_PAGE_LIST_TOPIC, jasmine.anything())
        .and.callFake((topic, callback) => {
          callback(DUPLICATE_PAGES);
          return {} as Subscription;
        });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to duplicate page list updates', () => {
      expect(webSocketService.subscribe).toHaveBeenCalledWith(
        DUPLICATE_PAGE_LIST_TOPIC,
        jasmine.anything()
      );
    });

    it('processes duplicate page list updates', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        duplicatePagesLoaded({ pages: DUPLICATE_PAGES })
      );
    });
  });

  describe('loading duplicate pages', () => {
    beforeEach(() => {
      component.dataSource.data = [
        { selected: true, item: DUPLICATE_PAGES[0] }
      ];
      component.duplicatePages = DUPLICATE_PAGES;
    });

    it('maintains existing selectsion', () => {
      expect(component.dataSource.data[0].selected).toBeTrue();
    });
  });

  describe('sorting data', () => {
    const ENTRY = {
      item: DUPLICATE_PAGES[0],
      selected: Math.random() > 0.5
    } as SelectableListItem<DuplicatePage>;

    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_HASH_LIST_FEATURE_KEY]: {
          ...initialBlockedPageListState,
          entries: [{ ...BLOCKED_HASH_1, hash: DUPLICATE_PAGES[0].hash }]
        }
      });
    });

    it('sorts by selection status', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'selection')
      ).toEqual(`${ENTRY.selected}`);
    });

    it('sorts by hash', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'hash')).toEqual(
        ENTRY.item.hash
      );
    });

    it('sorts by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'comic-count')
      ).toEqual(ENTRY.item.comics.length);
    });

    it('sorts by blocked state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'blocked')
      ).toEqual(`${true}`);
    });
  });

  describe('showing comics for a duplicate page', () => {
    const ENTRY = {
      item: DUPLICATE_PAGES[0],
      selected: Math.random() > 0.5
    } as SelectableListItem<DuplicatePage>;

    beforeEach(() => {
      component.onShowComicsWithPage(ENTRY);
    });

    it('opens a dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(
        ComicsWithDuplicatePageComponent,
        { data: ENTRY.item }
      );
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
        setBlockedState({ hashes: [ENTRY.item.hash], blocked: true })
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
        setBlockedState({ hashes: [ENTRY.item.hash], blocked: false })
      );
    });
  });

  describe('selections', () => {
    beforeEach(() => {
      component.duplicatePages = DUPLICATE_PAGES;
    });

    describe('selecting an element', () => {
      beforeEach(() => {
        component.anySelected = false;
        component.dataSource.data[0].selected = false;
        component.onSelectOne(component.dataSource.data[0], true);
      });

      it('sets the selection state', () => {
        expect(component.dataSource.data[0].selected).toBeTrue();
      });

      it('sets the any selected flag', () => {
        expect(component.anySelected).toBeTrue();
      });
    });

    describe('deselecting an element', () => {
      beforeEach(() => {
        component.anySelected = true;
        component.dataSource.data[0].selected = true;
        component.onSelectOne(component.dataSource.data[0], false);
      });

      it('clears the selection state', () => {
        expect(component.dataSource.data[0].selected).toBeFalse();
      });

      it('clears the any selected flag', () => {
        expect(component.anySelected).toBeFalse();
      });
    });

    describe('selecting all elements', () => {
      beforeEach(() => {
        component.anySelected = false;
        component.anySelected = false;
        component.dataSource.data.forEach(entry => (entry.selected = false));
        component.onSelectAll(true);
      });

      it('marks all as selected', () => {
        expect(
          component.dataSource.data.every(entry => entry.selected)
        ).toBeTrue();
      });

      it('sets the any selected flag', () => {
        expect(component.anySelected).toBeTrue();
      });

      it('sets the any selected flag', () => {
        expect(component.allSelected).toBeTrue();
      });

      describe('deselecting one item', () => {
        beforeEach(() => {
          component.onSelectOne(component.dataSource.data[0], false);
        });

        it('marks the element as unselected', () => {
          expect(component.dataSource.data[0].selected).toBeFalse();
        });

        it('clears the any selected flag', () => {
          expect(component.allSelected).toBeFalse();
        });
      });
    });

    describe('deselecting all elements', () => {
      beforeEach(() => {
        component.anySelected = true;
        component.anySelected = true;
        component.dataSource.data.forEach(entry => (entry.selected = true));
        component.onSelectAll(false);
      });

      it('unmarks all as selected', () => {
        expect(
          component.dataSource.data.every(entry => entry.selected)
        ).toBeFalse();
      });

      it('clears the any selected flag', () => {
        expect(component.anySelected).toBeFalse();
      });

      it('clears the any selected flag', () => {
        expect(component.allSelected).toBeFalse();
      });
    });
  });

  describe('processing all selected items', () => {
    beforeEach(() => {
      component.duplicatePages = DUPLICATE_PAGES;
      component.dataSource.data[0].selected = true;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
    });

    afterAll(() => {
      expect(
        component.dataSource.data.some(entry => entry.selected)
      ).toBeFalse();
    });

    describe('blocking selected items', () => {
      beforeEach(() => {
        component.onBlockSelected();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBlockedState({
            hashes: [DUPLICATE_PAGES[0].hash],
            blocked: true
          })
        );
      });
    });

    describe('unblocking selected items', () => {
      beforeEach(() => {
        component.onUnblockSelected();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBlockedState({
            hashes: [DUPLICATE_PAGES[0].hash],
            blocked: false
          })
        );
      });
    });
  });
});
