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
import { ImportComicsPageComponent } from './import-comics-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  COMIC_IMPORT_FEATURE_KEY,
  initialState as initialComicImportState
} from '@app/comic-file/reducers/comic-import.reducer';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
} from '@app/comic-file/comic-file.fixtures';
import { Confirmation } from '@app/core/models/confirmation';
import { sendComicFiles } from '@app/comic-file/actions/import-comic-files.actions';
import { USER_ADMIN, USER_READER } from '@app/user/user.fixtures';
import { User } from '@app/user/models/user';
import { MatIconModule } from '@angular/material/icon';
import { ComicFileToolbarComponent } from '@app/comic-file/components/comic-file-toolbar/comic-file-toolbar.component';
import { ComicFileListComponent } from '@app/comic-file/components/comic-file-list/comic-file-list.component';
import { ComicFileDetailsComponent } from '@app/comic-file/components/comic-file-details/comic-file-details.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ComicFileCoverUrlPipe } from '@app/comic-file/pipes/comic-file-cover-url.pipe';
import { MatCardModule } from '@angular/material/card';
import { ComicPageComponent } from '@app/comic-book/components/comic-page/comic-page.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DELETE_BLOCKED_PAGES_PREFERENCE,
  IGNORE_METADATA_PREFERENCE
} from '@app/library/library.constants';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  COMIC_FILE_LIST_FEATURE_KEY,
  initialState as initialComicFileListState
} from '@app/comic-file/reducers/comic-file-list.reducer';
import {
  IMPORT_COMIC_FILES_FEATURE_KEY,
  initialState as initialImportComicFilesState
} from '@app/comic-file/reducers/import-comic-files.reducer';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';

describe('ImportComicsPageComponent', () => {
  const USER = USER_READER;
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];
  const FILE = COMIC_FILE_3;
  const PAGE_SIZE = 400;
  const initialState = {
    [COMIC_FILE_LIST_FEATURE_KEY]: initialComicFileListState,
    [IMPORT_COMIC_FILES_FEATURE_KEY]: initialImportComicFilesState,
    [COMIC_IMPORT_FEATURE_KEY]: initialComicImportState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: ImportComicsPageComponent;
  let fixture: ComponentFixture<ImportComicsPageComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;
  let titleService: TitleService;
  let translateService: TranslateService;
  let dialog: MatDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ImportComicsPageComponent,
        ComicFileToolbarComponent,
        ComicFileListComponent,
        ComicFileDetailsComponent,
        ComicFileCoverUrlPipe,
        ComicPageComponent
      ],
      imports: [
        NoopAnimationsModule,
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
        MatTableModule,
        MatCardModule,
        MatTooltipModule,
        MatToolbarModule
      ],
      providers: [
        provideMockStore({ initialState }),
        ConfirmationService,
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComicsPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');
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
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
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
            name: IGNORE_METADATA_PREFERENCE,
            value: `${IGNORE_METADATA}`
          },
          {
            name: DELETE_BLOCKED_PAGES_PREFERENCE,
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
        store.setState({
          ...initialState,
          [COMIC_FILE_LIST_FEATURE_KEY]: {
            ...initialComicFileListState,
            loading: true
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: true })
        );
      });
    });

    describe('when loading stops', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [COMIC_FILE_LIST_FEATURE_KEY]: {
            ...initialComicFileListState,
            loading: false
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: false })
        );
      });
    });
  });

  describe('when a file is selected', () => {
    beforeEach(() => {
      component.pageSize = PAGE_SIZE;
      component.onCurrentFile(FILE);
    });

    it('opens a dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(ComicFileDetailsComponent, {
        data: { file: FILE, pageSize: PAGE_SIZE }
      });
    });
  });

  describe('when no file is selected', () => {
    beforeEach(() => {
      component.pageSize = PAGE_SIZE;
      component.onCurrentFile(null);
    });

    it('does not open a dialog', () => {
      expect(dialog.open).not.toHaveBeenCalled();
    });
  });

  describe('when sending files', () => {
    describe('when sending starts', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [IMPORT_COMIC_FILES_FEATURE_KEY]: {
            ...initialImportComicFilesState,
            sending: true
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: true })
        );
      });
    });

    describe('when sending stops', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [IMPORT_COMIC_FILES_FEATURE_KEY]: {
            ...initialImportComicFilesState,
            sending: false
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: false })
        );
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

      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.confirm()
      );
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
