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
import { BlockedHashListPageComponent } from './blocked-hash-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  BLOCKED_HASH_LIST_FEATURE_KEY,
  initialState as initialBlockedPageListState
} from '@app/comic-pages/reducers/blocked-hash-list.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_2,
  BLOCKED_HASH_3,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { downloadBlockedPages } from '@app/comic-pages/actions/download-blocked-pages.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { uploadBlockedPages } from '@app/comic-pages/actions/upload-blocked-pages.actions';
import { deleteBlockedPages } from '@app/comic-pages/actions/delete-blocked-pages.actions';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { markPagesWithHash } from '@app/comic-pages/actions/blocked-hash-list.actions';
import { TitleService } from '@app/core/services/title.service';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BlockedHashToolbarComponent } from '@app/comic-pages/components/blocked-hash-toolbar/blocked-hash-toolbar.component';
import { MatDividerModule } from '@angular/material/divider';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { PageHashUrlPipe } from '@app/comic-books/pipes/page-hash-url.pipe';

describe('BlockedHashListPageComponent', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const ENTRY = BLOCKED_HASH_2;
  const initialState = {
    [BLOCKED_HASH_LIST_FEATURE_KEY]: initialBlockedPageListState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_READER }
  };
  let component: BlockedHashListPageComponent;
  let fixture: ComponentFixture<BlockedHashListPageComponent>;
  let router: Router;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          BlockedHashListPageComponent,
          BlockedHashToolbarComponent,
          PageHashUrlPipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatToolbarModule,
          MatTableModule,
          MatPaginatorModule,
          MatCheckboxModule,
          MatDialogModule,
          MatIconModule,
          MatTooltipModule,
          MatSortModule,
          MatDividerModule
        ],
        providers: [
          provideMockStore({ initialState }),
          ConfirmationService,
          TitleService
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(BlockedHashListPageComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
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
      translateService.use('fr');
    });

    it('loads the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('receiving blocked page updates', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      store.setState({
        ...initialState,
        [BLOCKED_HASH_LIST_FEATURE_KEY]: {
          ...initialBlockedPageListState,
          entries: ENTRIES
        }
      });
    });

    it('updates the blocked hash list', () => {
      expect(component.dataSource.data).toEqual(ENTRIES);
    });
  });

  describe('downloading the blocked pages file', () => {
    beforeEach(() => {
      component.onDownloadFile();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(downloadBlockedPages());
    });
  });

  describe('when a file is selected', () => {
    const FILE = new File([], 'test');

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onFileSelected(FILE);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        uploadBlockedPages({ file: FILE })
      );
    });
  });

  describe('deleting blocked pages', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeleteEntry(ENTRY);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteBlockedPages({ entries: [ENTRY] })
      );
    });
  });

  describe('deleting pages with a hash', () => {
    const ENTRY = ENTRIES[0];

    beforeEach(() => {
      component.onMarkSelectedForDeletion(ENTRY, true);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        markPagesWithHash({
          hashes: [ENTRY.hash],
          deleted: true
        })
      );
    });
  });

  describe('undeleting pages with a hash', () => {
    const ENTRY = ENTRIES[0];

    beforeEach(() => {
      component.onMarkSelectedForDeletion(ENTRY, false);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        markPagesWithHash({
          hashes: [ENTRY.hash],
          deleted: false
        })
      );
    });
  });

  describe('sorting the list', () => {
    it('can sort by label', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'label')).toEqual(
        `${ENTRY.label}`
      );
    });

    it('can sort by hash', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'hash')).toEqual(
        `${ENTRY.hash}`
      );
    });

    it('can sort by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'comic-count')
      ).toEqual(ENTRY.comicCount);
    });

    it('can sort by created', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'created-on')
      ).toEqual(ENTRY.createdOn);
    });
  });

  describe('showing the blocked page popup', () => {
    describe('showing the popup', () => {
      beforeEach(() => {
        component.showPopup = false;
        component.currentBlockedHash = null;
        component.onShowPopup(true, ENTRY);
      });

      it('sets the show popup flag', () => {
        expect(component.showPopup).toBeTrue();
      });

      it('sets the current blocked hash', () => {
        expect(component.currentBlockedHash).toBe(ENTRY);
      });
    });

    describe('hiding the popup', () => {
      beforeEach(() => {
        component.currentBlockedHash = ENTRY;
        component.showPopup = true;
        component.onShowPopup(false, null);
      });

      it('clears the show popup flag', () => {
        expect(component.showPopup).toBeFalse();
      });

      it('clears the current blocked hash', () => {
        expect(component.currentBlockedHash).toBeNull();
      });
    });
  });
});
