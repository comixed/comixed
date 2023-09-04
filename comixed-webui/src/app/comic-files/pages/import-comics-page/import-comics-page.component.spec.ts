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
import { ImportComicsPageComponent } from './import-comics-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
} from '@app/comic-files/comic-file.fixtures';
import { sendComicFiles } from '@app/comic-files/actions/import-comic-files.actions';
import { USER_ADMIN, USER_READER } from '@app/user/user.fixtures';
import { User } from '@app/user/models/user';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ComicFileCoverUrlPipe } from '@app/comic-files/pipes/comic-file-cover-url.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  COMIC_FILE_LIST_FEATURE_KEY,
  initialState as initialComicFileListState
} from '@app/comic-files/reducers/comic-file-list.reducer';
import {
  IMPORT_COMIC_FILES_FEATURE_KEY,
  initialState as initialImportComicFilesState
} from '@app/comic-files/reducers/import-comic-files.reducer';
import { TitleService } from '@app/core/services/title.service';
import { MatMenuModule } from '@angular/material/menu';
import {
  initialState as initialProcessComicsState,
  PROCESS_COMICS_FEATURE_KEY
} from '@app/reducers/process-comics.reducer';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ComicFileLoaderComponent } from '@app/comic-files/components/comic-file-loader/comic-file-loader.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSortModule } from '@angular/material/sort';
import { SKIP_METADATA_USER_PREFERENCE } from '@app/comic-files/comic-file.constants';
import { Router } from '@angular/router';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { SelectableListItem } from '@app/core/models/ui/selectable-list-item';
import {
  clearComicFileSelections,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';

describe('ImportComicsPageComponent', () => {
  const USER = USER_READER;
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];
  const FILE = COMIC_FILE_3;
  const PAGE_SIZE = 400;
  const initialState = {
    [COMIC_FILE_LIST_FEATURE_KEY]: initialComicFileListState,
    [IMPORT_COMIC_FILES_FEATURE_KEY]: initialImportComicFilesState,
    [PROCESS_COMICS_FEATURE_KEY]: initialProcessComicsState,
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: ImportComicsPageComponent;
  let fixture: ComponentFixture<ImportComicsPageComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;
  let titleService: TitleService;
  let translateService: TranslateService;
  let dialog: MatDialog;
  let router: Router;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ImportComicsPageComponent,
          ComicFileLoaderComponent,
          ComicFileCoverUrlPipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
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
          MatToolbarModule,
          MatMenuModule,
          MatPaginatorModule,
          MatSortModule
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
      router = TestBed.inject(Router);
      spyOn(router, 'navigateByUrl');
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

    it('sets the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading user preferences', () => {
    const SKIP_METADATA = true;

    beforeEach(() => {
      component.skipMetadata = false;
      const user = {
        ...USER_ADMIN,
        preferences: [
          {
            name: SKIP_METADATA_USER_PREFERENCE,
            value: `${SKIP_METADATA}`
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

    it('sets the skip metadata flag', () => {
      expect(component.skipMetadata).toEqual(SKIP_METADATA);
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
        component.selectedFiles = FILES;
        component.allSelected = false;
        component.anySelected = false;
        store.setState({
          ...initialState,
          [COMIC_FILE_LIST_FEATURE_KEY]: {
            ...initialComicFileListState,
            loading: false,
            files: FILES
          }
        });
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setBusyState({ enabled: false })
        );
      });

      it('updates the any selected flag', () => {
        expect(component.anySelected).toBeTrue();
      });

      it('updates the all selected flag', () => {
        expect(component.allSelected).toBeTrue();
      });
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
    beforeEach(() => {
      component.files = FILES;
      component.selectedFiles = FILES;

      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.confirm()
      );
    });

    describe('not skipping metadata', () => {
      beforeEach(() => {
        component.skipMetadata = false;
        component.onStartImport();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          sendComicFiles({
            files: FILES,
            skipMetadata: false
          })
        );
      });
    });

    describe('skipping metadata', () => {
      beforeEach(() => {
        component.skipMetadata = true;
        component.onStartImport();
      });

      it('confirms with the user', () => {
        expect(confirmationService.confirm).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          sendComicFiles({
            files: FILES,
            skipMetadata: true
          })
        );
      });
    });
  });

  describe('when commics are already importing', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [PROCESS_COMICS_FEATURE_KEY]: {
          ...initialProcessComicsState,
          active: true
        }
      });
    });

    it('redirects the browser to the status page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith(
        '/library/import/status'
      );
    });
  });

  describe('sorting records', () => {
    const ITEM = {
      item: COMIC_FILE_3,
      selected: Math.random() > 0.5
    } as SelectableListItem<ComicFile>;

    it('can sort by selected state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'selected')
      ).toEqual(`${ITEM.selected}`);
    });

    it('can sort by selected filename', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'filename')
      ).toEqual(ITEM.item.filename);
    });

    it('can sort by selected base filename', () => {
      expect(
        component.dataSource.sortingDataAccessor(ITEM, 'base-filename')
      ).toEqual(ITEM.item.baseFilename);
    });

    it('can sort by selected size', () => {
      expect(component.dataSource.sortingDataAccessor(ITEM, 'size')).toEqual(
        ITEM.item.size
      );
    });

    it('can sort by default', () => {
      expect(component.dataSource.sortingDataAccessor(ITEM, 'unknown')).toEqual(
        ITEM.item.id
      );
    });
  });

  describe('selecting comic files', () => {
    beforeEach(() => {
      component.files = FILES;
      component.selectedFiles = FILES;
    });

    describe('it can select all', () => {
      beforeEach(() => {
        component.onToggleAllSelected(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ selected: true, files: FILES })
        );
      });
    });

    describe('it can deselect all', () => {
      beforeEach(() => {
        component.onToggleAllSelected(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(clearComicFileSelections());
      });
    });

    describe('toggling a single file', () => {
      const SELECTED = Math.random() > 0.5;

      beforeEach(() => {
        component.onSelectEntry(FILE, SELECTED);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: SELECTED })
        );
      });
    });
  });

  describe('toggling the skip metadata flag', () => {
    const SKIP_METADATA = Math.random() > 0.5;

    beforeEach(() => {
      component.onSkipMetadata(SKIP_METADATA);
    });

    it('saves the user preference', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: SKIP_METADATA_USER_PREFERENCE,
          value: `${SKIP_METADATA}`
        })
      );
    });
  });

  describe('the comic file cover popup', () => {
    describe('showing the popup', () => {
      beforeEach(() => {
        component.comicFile = null;
        component.showCoverPopup = false;
        component.onShowPopup(true, FILE);
      });

      it('stores the comic file reference', () => {
        expect(component.comicFile).toBe(FILE);
      });

      it('sets the show popup flag', () => {
        expect(component.showCoverPopup).toBeTrue();
      });
    });

    describe('showing the popup', () => {
      beforeEach(() => {
        component.comicFile = FILE;
        component.showCoverPopup = true;
        component.onShowPopup(false, null);
      });

      it('clears the comic file reference', () => {
        expect(component.comicFile).toBeNull();
      });

      it('clears the show popup flag', () => {
        expect(component.showCoverPopup).toBeFalse();
      });
    });
  });
});
