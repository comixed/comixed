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
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
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
import {
  downloadBlockedHashesFile,
  markPagesWithHash,
  uploadBlockedHashesFile
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { deleteBlockedPages } from '@app/comic-pages/actions/delete-blocked-pages.actions';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleService } from '@app/core/services/title.service';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule } from '@angular/material/divider';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { BlockedHashThumbnailUrlPipe } from '@app/comic-pages/pipes/blocked-hash-thumbnail-url.pipe';
import {
  BLOCKED_HASHES_FEATURE_KEY,
  initialState as initialBlockedHashesState
} from '@app/comic-pages/reducers/blocked-hashes.reducer';

describe('BlockedHashListPageComponent', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const ENTRY = BLOCKED_HASH_2;
  const initialState = {
    [BLOCKED_HASHES_FEATURE_KEY]: initialBlockedHashesState,
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
          BlockedHashThumbnailUrlPipe
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
      store.setState({
        ...initialState,
        [BLOCKED_HASHES_FEATURE_KEY]: {
          ...initialBlockedHashesState,
          entries: ENTRIES
        }
      });
      component.dataSource.data.forEach(entry => (entry.selected = true));
      store.setState({
        ...initialState,
        [BLOCKED_HASHES_FEATURE_KEY]: {
          ...initialBlockedHashesState,
          entries: ENTRIES.concat(ENTRY)
        }
      });
    });

    it('maintains the existing selections', () => {
      component.dataSource.data
        .filter(entry =>
          ENTRIES.map(mapEntry => mapEntry.id).includes(entry.item.id)
        )
        .forEach(entry => expect(entry.selected).toBeTrue());
    });

    it('does not select the addition', () => {
      component.dataSource.data
        .filter(entry => entry.item.id === ENTRY.id)
        .forEach(entry => expect(entry.selected).toBeFalse());
    });
  });

  describe('toggling a selection', () => {
    let entry: SelectableListItem<BlockedHash>;

    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_HASHES_FEATURE_KEY]: {
          ...initialBlockedHashesState,
          entries: ENTRIES
        }
      });
      entry = component.dataSource.data[0];
      component.hasSelections = false;
      component.onSelectOne(entry, true);
    });

    it('sets the checked state for the item', () => {
      expect(entry.selected).toBeTrue();
    });

    it('sets the has selections flag', () => {
      expect(component.hasSelections).toBeTrue();
    });
  });

  describe('toggling all selections', () => {
    beforeEach(() => {
      component.entries = ENTRIES;
      component.onSelectAll(true);
    });

    it('selects all items', () => {
      expect(
        component.dataSource.data.every(entry => entry.selected)
      ).toBeTrue();
    });

    it('sets the all selected flag', () => {
      expect(component.allSelected).toBeTrue();
    });

    it('sets the some selection flag', () => {
      expect(component.hasSelections).toBeTrue();
    });

    describe('unselecting one item', () => {
      beforeEach(() => {
        component.onSelectOne(component.dataSource.data[0], false);
      });

      it('clears the all selected flag', () => {
        expect(component.allSelected).toBeFalse();
      });

      it('sets the some selection flag', () => {
        expect(component.hasSelections).toBeTrue();
      });
    });

    describe('deselecting all items', () => {
      beforeEach(() => {
        component.onSelectAll(false);
      });

      it('clears the all selected flag', () => {
        expect(component.allSelected).toBeFalse();
      });

      it('clears the some selection flag', () => {
        expect(component.hasSelections).toBeFalse();
      });
    });
  });

  describe('downloading the blocked pages file', () => {
    beforeEach(() => {
      component.onDownloadFile();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(downloadBlockedHashesFile());
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
        uploadBlockedHashesFile({ file: FILE })
      );
    });
  });

  describe('deleting blocked pages', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_HASHES_FEATURE_KEY]: {
          ...initialBlockedHashesState,
          entries: ENTRIES
        }
      });
      component.dataSource.data.forEach(entry => (entry.selected = false));
      component.dataSource.data[0].selected = true;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onDeleteEntries();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteBlockedPages({ entries: [ENTRIES[0]] })
      );
    });
  });

  describe('processing blocked pages', () => {
    beforeEach(() => {
      component.entries = ENTRIES;
      component.dataSource.data.forEach(entry => (entry.selected = true));
    });

    describe('marking them for deletion', () => {
      beforeEach(() => {
        spyOn(confirmationService, 'confirm').and.callFake(
          (confirmation: Confirmation) => confirmation.confirm()
        );
        component.onMarkSelectedForDeletion();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markPagesWithHash({
            hashes: ENTRIES.map(entry => entry.hash),
            deleted: true
          })
        );
      });
    });

    describe('clearing them for deletion', () => {
      beforeEach(() => {
        spyOn(confirmationService, 'confirm').and.callFake(
          (confirmation: Confirmation) => confirmation.confirm()
        );
        component.onClearSelectedForDeletion();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          markPagesWithHash({
            hashes: ENTRIES.map(entry => entry.hash),
            deleted: false
          })
        );
      });
    });
  });

  describe('sorting the list', () => {
    const ITEM = {
      item: ENTRY,
      selected: Math.random() > 0.5
    } as SelectableListItem<BlockedHash>;

    it('can sort by selected state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'selected')
      ).toEqual(`${ITEM.selected}`);
    });

    it('can sort by label', () => {
      expect(component.dataSource.sortingDataAccessor(ITEM, 'label')).toEqual(
        `${ITEM.item.label}`
      );
    });

    it('can sort by hash', () => {
      expect(component.dataSource.sortingDataAccessor(ITEM, 'hash')).toEqual(
        `${ITEM.item.hash}`
      );
    });

    it('can sort by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'comic-count')
      ).toEqual(ITEM.item.comicCount);
    });

    it('can sort by created', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'created-on')
      ).toEqual(ITEM.item.createdOn);
    });
  });

  describe('getting the selected hashes', () => {
    beforeEach(() => {
      component.entries = ENTRIES;
      component.dataSource.data.forEach(entry => (entry.selected = true));
    });

    it('returns the selected entries', () => {
      expect(component.selectedHashes).toEqual(ENTRIES);
    });
  });
});
