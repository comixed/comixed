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
import { ComicFileToolbarComponent } from './comic-file-toolbar.component';
import { LoggerModule } from '@angular-ru/logger';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  ROOT_DIRECTORY
} from '@app/comic-file/comic-file.fixtures';
import { MatInputModule } from '@angular/material/input';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  clearComicFileSelections,
  loadComicFiles,
  setComicFilesSelectedState
} from '@app/comic-file/actions/comic-file-list.actions';
import { sendComicFiles } from '@app/comic-file/actions/import-comic-files.actions';
import { Preference } from '@app/user/models/preference';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ComicFileToolbarComponent', () => {
  const USER = USER_ADMIN;
  const MAXIMUM = 100;
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
  const initialState = {};

  let component: ComicFileToolbarComponent;
  let fixture: ComponentFixture<ComicFileToolbarComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicFileToolbarComponent],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatToolbarModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileToolbarComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when a user is assigned', () => {
    beforeEach(() => {
      const preferences = [
        { name: IMPORT_ROOT_DIRECTORY_PREFERENCE, value: ROOT_DIRECTORY },
        { name: IMPORT_MAXIMUM_RESULTS_PREFERENCE, value: MAXIMUM }
      ] as Preference[];
      component.user = { ...USER, preferences };
    });

    it('loads the root directory', () => {
      expect(component.loadFilesForm.controls.rootDirectory.value).toEqual(
        ROOT_DIRECTORY
      );
    });

    it('loads the root diretory', () => {
      expect(component.loadFilesForm.controls.maximum.value).toEqual(MAXIMUM);
    });
  });

  describe('loading files', () => {
    beforeEach(() => {
      component.loadFilesForm.controls.rootDirectory.setValue(ROOT_DIRECTORY);
      component.loadFilesForm.controls.maximum.setValue(MAXIMUM);
      fixture.detectChanges();
      component.onLoadFiles();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadComicFiles({ directory: ROOT_DIRECTORY, maximum: MAXIMUM })
      );
    });
  });

  describe('selecting all comic file', () => {
    beforeEach(() => {
      component.comicFiles = COMIC_FILES;
      component.onSelectAll();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicFilesSelectedState({ files: COMIC_FILES, selected: true })
      );
    });
  });

  describe('deselecting comic files', () => {
    beforeEach(() => {
      component.selectedComicFiles = COMIC_FILES;
      component.onDeselectAll();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(clearComicFileSelections());
    });
  });

  describe('toggling the ignore metadata flag', () => {
    const IGNORED = Math.random() > 0.5;

    beforeEach(() => {
      component.ignoreMetadata = IGNORED;
      component.onToggleIgnoreMetadata();
    });

    it('flips the flag', () => {
      expect(component.ignoreMetadata).not.toEqual(IGNORED);
    });
  });

  describe('marking blocked pages for deletion', () => {
    const MARKED = Math.random() > 0.5;

    beforeEach(() => {
      component.deleteBlockedPages = MARKED;
      component.onToggleDeleteBlockedPages();
    });

    it('flips the flag', () => {
      expect(component.deleteBlockedPages).not.toEqual(MARKED);
    });
  });

  describe('starting the import process', () => {
    const IGNORED = Math.random() > 0.5;
    const MARKED = Math.random() > 0.5;

    beforeEach(() => {
      component.ignoreMetadata = IGNORED;
      component.deleteBlockedPages = MARKED;
      component.selectedComicFiles = COMIC_FILES;
      component.onStartImport();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        sendComicFiles({
          files: COMIC_FILES,
          ignoreMetadata: IGNORED,
          deleteBlockedPages: MARKED
        })
      );
    });
  });

  describe('toggling the file lookup form', () => {
    const SETTING = Math.random() > 0.5;

    beforeEach(() => {
      component.showLookupForm = SETTING;
      component.onToggleFileLookupForm();
    });

    it('toggles the setting', () => {
      expect(component.showLookupForm).toEqual(!SETTING);
    });
  });
});
