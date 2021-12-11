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
import { ComicFileToolbarComponent } from './comic-file-toolbar.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
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
} from '@app/comic-files/comic-file.fixtures';
import { MatInputModule } from '@angular/material/input';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_PREFERENCE,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  clearComicFileSelections,
  loadComicFiles
} from '@app/comic-files/actions/comic-file-list.actions';
import { sendComicFiles } from '@app/comic-files/actions/import-comic-files.actions';
import { Preference } from '@app/user/models/preference';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { Confirmation } from '@app/core/models/confirmation';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('ComicFileToolbarComponent', () => {
  const USER = USER_ADMIN;
  const MAXIMUM = 100;
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
  const PAGE_SIZE = 25;
  const initialState = {};

  let component: ComicFileToolbarComponent;
  let fixture: ComponentFixture<ComicFileToolbarComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicFileToolbarComponent],
        imports: [
          BrowserAnimationsModule,
          FormsModule,
          ReactiveFormsModule,
          TranslateModule.forRoot(),
          LoggerModule.forRoot(),
          MatFormFieldModule,
          MatButtonModule,
          MatIconModule,
          MatSelectModule,
          MatInputModule,
          MatToolbarModule,
          MatTooltipModule,
          MatPaginatorModule,
          MatDialogModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicFileToolbarComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

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
      spyOn(component.selectAll, 'emit');
      component.onSelectAll();
    });

    it('emits an event', () => {
      expect(component.selectAll.emit).toHaveBeenCalled();
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

  describe('starting the import process', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.selectedComicFiles = COMIC_FILES;
      component.onStartImport();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        sendComicFiles({
          files: COMIC_FILES
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

  describe('the page size being changed', () => {
    beforeEach(() => {
      component.onPageSizeChange(PAGE_SIZE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: PAGE_SIZE_PREFERENCE,
          value: `${PAGE_SIZE}`
        })
      );
    });
  });
});
