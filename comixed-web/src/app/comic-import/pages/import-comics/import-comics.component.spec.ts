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
import { ImportComicsComponent } from './import-comics.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  COMIC_IMPORT_FEATURE_KEY,
  initialState as initialComicImportState
} from '@app/comic-import/reducers/comic-import.reducer';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from '@app/comic-import/comic-import.fixtures';
import { ConfirmationService } from '@app/core';
import { Confirmation } from '@app/core/models/confirmation';
import { sendComicFiles } from '@app/comic-import/actions/comic-import.actions';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { User } from '@app/user/models/user';
import {
  USER_PREFERENCE_DELETE_BLOCKED_PAGES,
  USER_PREFERENCE_IGNORE_METADATA
} from '@app/user/user.constants';
import { MatIconModule } from '@angular/material/icon';
import { ImportToolbarComponent } from '@app/comic-import/components/import-toolbar/import-toolbar.component';
import { ComicFileListComponent } from '@app/comic-import/components/comic-file-list/comic-file-list.component';
import { ComicFileDetailsComponent } from '@app/comic-import/components/comic-file-details/comic-file-details.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ComicFileCoverUrlPipe } from '@app/comic-import/pipes/comic-file-cover-url.pipe';
import { Title } from '@angular/platform-browser';

describe('ImportComicsComponent', () => {
  const initialState = {
    [COMIC_IMPORT_FEATURE_KEY]: initialComicImportState,
    [USER_FEATURE_KEY]: initialUserState
  };
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];
  const FILE = COMIC_FILE_3;

  let component: ImportComicsComponent;
  let fixture: ComponentFixture<ImportComicsComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;
  let title: Title;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule
      ],
      declarations: [
        ImportComicsComponent,
        ImportToolbarComponent,
        ComicFileListComponent,
        ComicFileDetailsComponent,
        ComicFileCoverUrlPipe
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComicsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    title = TestBed.inject(Title);
    spyOn(title, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('sets the page title', () => {
      expect(title.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading user preferences', () => {
    const IGNORE_METADATA = Math.random() > 0.5;
    const DELETE_BLOCKED_PAGES = Math.random() > 0.5;

    beforeEach(() => {
      const user = {
        ...USER_ADMIN,
        preferences: [
          {
            name: USER_PREFERENCE_IGNORE_METADATA,
            value: `${IGNORE_METADATA}`
          },
          {
            name: USER_PREFERENCE_DELETE_BLOCKED_PAGES,
            value: `${DELETE_BLOCKED_PAGES}`
          }
        ]
      } as User;
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          user
        }
      });
    });

    it('sets the ignore metadata flag', () => {
      expect(component.ignoreMetadata).toEqual(IGNORE_METADATA);
    });

    it('sets the delete blocked pages flag', () => {
      expect(component.deleteBlockedPages).toEqual(DELETE_BLOCKED_PAGES);
    });
  });

  describe('when loading files', () => {
    describe('when loading starts', () => {
      beforeEach(() => {
        component.busy = false;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            loading: true
          }
        });
      });

      it('sets the busy flag', () => {
        expect(component.busy).toBeTruthy();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: true })
        );
      });
    });

    describe('when loading stops', () => {
      beforeEach(() => {
        component.busy = true;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            loading: false
          }
        });
      });

      it('clears the busy flag', () => {
        expect(component.busy).toBeFalsy();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: false })
        );
      });
    });
  });

  describe('when sending files', () => {
    describe('when sending starts', () => {
      beforeEach(() => {
        component.busy = false;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            sending: true
          }
        });
      });

      it('sets the busy flag', () => {
        expect(component.busy).toBeTruthy();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: true })
        );
      });
    });

    describe('when sending stops', () => {
      beforeEach(() => {
        component.busy = true;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            sending: false
          }
        });
      });

      it('clears the busy flag', () => {
        expect(component.busy).toBeFalsy();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: false })
        );
      });
    });
  });

  describe('setting the current file', () => {
    beforeEach(() => {
      component.currentFile = null;
      component.currentFileSelected = false;
    });

    describe('and the file is not selected', () => {
      beforeEach(() => {
        component.selectedFiles = [];
        component.onCurrentFile(FILE);
      });

      it('sets the current file', () => {
        expect(component.currentFile).toEqual(FILE);
      });

      it('clears the current file selected flag', () => {
        expect(component.currentFileSelected).toBeFalsy();
      });
    });

    describe('and the file is selected', () => {
      beforeEach(() => {
        component.selectedFiles = [FILE];
        component.onCurrentFile(FILE);
      });

      it('sets the current file', () => {
        expect(component.currentFile).toEqual(FILE);
      });

      it('sets the current file selected flag', () => {
        expect(component.currentFileSelected).toBeTruthy();
      });
    });
  });

  describe('file selection updates', () => {
    const SELECTED_FILE = COMIC_FILE_1;
    const CURRENT_FILE = COMIC_FILE_2;

    describe('when there is no current file', () => {
      beforeEach(() => {
        component.currentFile = null;
        component.currentFileSelected = true;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            selections: [SELECTED_FILE]
          }
        });
        fixture.detectChanges();
      });

      it('clears the current file selected flag', () => {
        expect(component.currentFileSelected).toBeFalsy();
      });
    });

    describe('when the current file is not selected', () => {
      beforeEach(() => {
        component.currentFile = CURRENT_FILE;
        component.currentFileSelected = true;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            selections: [SELECTED_FILE]
          }
        });
        fixture.detectChanges();
      });

      it('clears the current file selected flag', () => {
        expect(component.currentFileSelected).toBeFalsy();
      });
    });

    describe('when the current file is selected', () => {
      beforeEach(() => {
        component.currentFile = SELECTED_FILE;
        component.currentFileSelected = false;
        store.setState({
          ...initialState,
          [COMIC_IMPORT_FEATURE_KEY]: {
            ...initialComicImportState,
            selections: [SELECTED_FILE]
          }
        });
        fixture.detectChanges();
      });

      it('clears the current file selected flag', () => {
        expect(component.currentFileSelected).toBeTruthy();
      });
    });
  });

  describe('starting the import process', () => {
    const IGNORE_METADATA = Math.random() > 0.5;
    const DELETE_BLOCKED_PAGES = Math.random() > 0.5;

    beforeEach(() => {
      component.files = FILES;
      component.selectedFiles = FILES;
      component.ignoreMetadata = IGNORE_METADATA;
      component.deleteBlockedPages = DELETE_BLOCKED_PAGES;

      spyOn(
        confirmationService,
        'confirm'
      ).and.callFake((confirm: Confirmation) => confirm.confirm());
      component.onStartImport();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        sendComicFiles({
          files: FILES,
          ignoreMetadata: IGNORE_METADATA,
          deleteBlockedPages: DELETE_BLOCKED_PAGES
        })
      );
    });
  });
});
