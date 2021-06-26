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
import { BlockedPageListPageComponent } from './blocked-page-list-page.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  BLOCKED_PAGE_LIST_FEATURE_KEY,
  initialState as initialBlockedPageListState
} from '@app/blocked-pages/reducers/blocked-page-list.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BlockedPage } from '@app/blocked-pages/models/blocked-page';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_2,
  BLOCKED_PAGE_3,
  BLOCKED_PAGE_5
} from '@app/blocked-pages/blocked-pages.fixtures';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { downloadBlockedPages } from '@app/blocked-pages/actions/download-blocked-pages.actions';
import { MatDialogModule } from '@angular/material/dialog';
import { Confirmation } from '@app/core/models/confirmation';
import { uploadBlockedPages } from '@app/blocked-pages/actions/upload-blocked-pages.actions';
import { deleteBlockedPages } from '@app/blocked-pages/actions/delete-blocked-pages.actions';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('BlockedPageListPageComponent', () => {
  const ENTRIES = [BLOCKED_PAGE_1, BLOCKED_PAGE_3, BLOCKED_PAGE_5];
  const ENTRY = BLOCKED_PAGE_2;
  const initialState = {
    [BLOCKED_PAGE_LIST_FEATURE_KEY]: initialBlockedPageListState
  };
  let component: BlockedPageListPageComponent;
  let fixture: ComponentFixture<BlockedPageListPageComponent>;
  let router: Router;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlockedPageListPageComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatToolbarModule,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatDialogModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(BlockedPageListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('receiving blocked page updates', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_PAGE_LIST_FEATURE_KEY]: {
          ...initialBlockedPageListState,
          entries: ENTRIES
        }
      });
      component.dataSource.data.forEach(entry => (entry.selected = true));
      store.setState({
        ...initialState,
        [BLOCKED_PAGE_LIST_FEATURE_KEY]: {
          ...initialBlockedPageListState,
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
    let entry: SelectableListItem<BlockedPage>;

    beforeEach(() => {
      store.setState({
        ...initialState,
        [BLOCKED_PAGE_LIST_FEATURE_KEY]: {
          ...initialBlockedPageListState,
          entries: ENTRIES
        }
      });
      entry = component.dataSource.data[0];
      component.hasSelections = false;
      component.onChangeSelection(entry, true);
    });

    it('sets the checked state for the item', () => {
      expect(entry.selected).toBeTrue();
    });

    it('sets the has selections flag', () => {
      expect(component.hasSelections).toBeTrue();
    });
  });

  describe('when a row is selected', () => {
    beforeEach(() => {
      component.onOpenBlockedPageDetails({
        item: ENTRY,
        selected: true
      } as SelectableListItem<BlockedPage>);
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/admin',
        'pages',
        'blocked',
        ENTRY.hash
      ]);
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

  describe('clicking the upload file button', () => {
    beforeEach(() => {
      component.showUploadRow = false;
      component.onShowUploadRow();
    });

    it('sets the show upload row flag', () => {
      expect(component.showUploadRow).toBeTrue();
    });
  });

  describe('when a file is selected', () => {
    const FILE = new File([], 'test');
    const EVENT = {
      stopPropagation: jasmine.createSpy(),
      target: { files: [FILE] }
    };

    beforeEach(() => {
      component.showUploadRow = true;
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onFileSelected(EVENT);
    });

    it('hides the upload row', () => {
      expect(component.showUploadRow).toBeFalse();
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
      store.setState({
        ...initialState,
        [BLOCKED_PAGE_LIST_FEATURE_KEY]: {
          ...initialBlockedPageListState,
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
});
