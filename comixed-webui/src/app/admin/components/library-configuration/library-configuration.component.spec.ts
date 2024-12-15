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
import { LibraryConfigurationComponent } from './library-configuration.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import {
  BLOCKED_PAGES_ENABLED,
  CREATE_EXTERNAL_METADATA_FILES,
  LIBRARY_COMIC_RENAMING_RULE,
  LIBRARY_DELETE_EMPTY_DIRECTORIES,
  LIBRARY_DELETE_PURGED_COMIC_FILES,
  LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
  LIBRARY_NO_RECREATE_COMICS,
  LIBRARY_PAGE_RENAMING_RULE,
  LIBRARY_ROOT_DIRECTORY,
  LIBRARY_STRIP_HTML_FROM_METADATA,
  SKIP_INTERNAL_METADATA_FILES
} from '@app/admin/admin.constants';
import { saveConfigurationOptions } from '@app/admin/actions/save-configuration-options.actions';
import {
  Confirmation,
  ConfirmationService
} from '@tragically-slick/confirmation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { purgeLibrary } from '@app/library/actions/purge-library.actions';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('LibraryConfigurationComponent', () => {
  const DELETE_PURGED_COMIC_FILES = Math.random() > 0.5;
  const DELETE_EMPTY_DIRECTORIES = Math.random() > 0.5;
  const DONT_MOVE_UNSCRAPED_COMICS = Math.random() > 0.5;
  const CREATE_EXTERNAL_METADATA = Math.random() > 0.5;
  const SKIP_INTERNAL_METADATA = Math.random() > 0.5;
  const LIBRARY_ROOT = 'The library root';
  const COMIC_RENAMING_RULE = 'The comic renaming rule';
  const NO_RECREATE_COMICS = Math.random() > 0.5;
  const PAGE_RENAMING_RULE = 'The page renaming rule';
  const BLOCKED_PAGES_ENABLED_FEATURE_STATE = Math.random() > 0.5;
  const LIBRARY_STRIP_HTML_FROM_METADATA_STATE = Math.random() > 0.5;
  const OPTIONS = [
    {
      name: LIBRARY_COMIC_RENAMING_RULE,
      value: COMIC_RENAMING_RULE
    },
    {
      name: LIBRARY_NO_RECREATE_COMICS,
      value: `${NO_RECREATE_COMICS}`
    },
    {
      name: LIBRARY_ROOT_DIRECTORY,
      value: LIBRARY_ROOT
    },
    {
      name: LIBRARY_PAGE_RENAMING_RULE,
      value: PAGE_RENAMING_RULE
    },
    {
      name: LIBRARY_DELETE_PURGED_COMIC_FILES,
      value: `${DELETE_PURGED_COMIC_FILES}`
    },
    {
      name: LIBRARY_DELETE_EMPTY_DIRECTORIES,
      value: `${DELETE_EMPTY_DIRECTORIES}`
    },
    {
      name: LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
      value: `${DONT_MOVE_UNSCRAPED_COMICS}`
    },
    {
      name: CREATE_EXTERNAL_METADATA_FILES,
      value: `${CREATE_EXTERNAL_METADATA}`
    },
    {
      name: SKIP_INTERNAL_METADATA_FILES,
      value: `${SKIP_INTERNAL_METADATA}`
    },
    {
      name: BLOCKED_PAGES_ENABLED,
      value: `${BLOCKED_PAGES_ENABLED_FEATURE_STATE}`
    },
    {
      name: LIBRARY_STRIP_HTML_FROM_METADATA,
      value: `${LIBRARY_STRIP_HTML_FROM_METADATA_STATE}`
    }
  ];
  const initialState = {};

  let component: LibraryConfigurationComponent;
  let fixture: ComponentFixture<LibraryConfigurationComponent>;
  let store: MockStore<any>;
  let spyOnStoreDispatch: jasmine.Spy;
  let confirmationService: ConfirmationService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LibraryConfigurationComponent],
        imports: [
          NoopAnimationsModule,
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatFormFieldModule,
          MatInputModule,
          MatExpansionModule,
          MatDialogModule,
          MatCheckboxModule,
          MatToolbarModule,
          MatIconModule,
          MatTooltipModule
        ],
        providers: [provideMockStore({ initialState }), ConfirmationService]
      }).compileComponents();

      fixture = TestBed.createComponent(LibraryConfigurationComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOnStoreDispatch = spyOn(store, 'dispatch');
      confirmationService = TestBed.inject(ConfirmationService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading the options', () => {
    beforeEach(() => {
      component.options = OPTIONS;
    });

    it('sets the delete purged comic files value', () => {
      expect(
        component.libraryConfigurationForm.controls
          .deletePurgedComicFilesDirectories.value
      ).toEqual(DELETE_PURGED_COMIC_FILES);
    });

    it('sets the delete empty directories value', () => {
      expect(
        component.libraryConfigurationForm.controls.deleteEmptyDirectories.value
      ).toEqual(DELETE_EMPTY_DIRECTORIES);
    });

    it('sets the do not move unscraped comics value', () => {
      expect(
        component.libraryConfigurationForm.controls.dontMoveUnscrapedComics
          .value
      ).toEqual(DONT_MOVE_UNSCRAPED_COMICS);
    });

    it('sets the library root value', () => {
      expect(
        component.libraryConfigurationForm.controls.rootDirectory.value
      ).toEqual(LIBRARY_ROOT);
    });

    it('sets the comic renaming rule value', () => {
      expect(
        component.libraryConfigurationForm.controls.comicRenamingRule.value
      ).toEqual(COMIC_RENAMING_RULE);
    });

    it('sets the comic renaming rule value', () => {
      expect(
        component.libraryConfigurationForm.controls.noRecreateComics.value
      ).toEqual(NO_RECREATE_COMICS);
    });

    it('sets the page renaming rule value', () => {
      expect(
        component.libraryConfigurationForm.controls.pageRenamingRule.value
      ).toEqual(PAGE_RENAMING_RULE);
    });
  });

  describe('saving the options', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      spyOnStoreDispatch.calls.reset();
      component.options = OPTIONS;
      component.onSave();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveConfigurationOptions({
          options: [
            {
              name: LIBRARY_DELETE_PURGED_COMIC_FILES,
              value: `${DELETE_PURGED_COMIC_FILES}`
            },
            {
              name: LIBRARY_DELETE_EMPTY_DIRECTORIES,
              value: `${DELETE_EMPTY_DIRECTORIES}`
            },
            {
              name: LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
              value: `${DONT_MOVE_UNSCRAPED_COMICS}`
            },
            {
              name: CREATE_EXTERNAL_METADATA_FILES,
              value: `${CREATE_EXTERNAL_METADATA}`
            },
            {
              name: SKIP_INTERNAL_METADATA_FILES,
              value: `${SKIP_INTERNAL_METADATA}`
            },
            {
              name: LIBRARY_NO_RECREATE_COMICS,
              value: `${NO_RECREATE_COMICS}`
            },
            { name: LIBRARY_ROOT_DIRECTORY, value: LIBRARY_ROOT },
            { name: LIBRARY_COMIC_RENAMING_RULE, value: COMIC_RENAMING_RULE },
            { name: LIBRARY_PAGE_RENAMING_RULE, value: PAGE_RENAMING_RULE },
            {
              name: BLOCKED_PAGES_ENABLED,
              value: `${BLOCKED_PAGES_ENABLED_FEATURE_STATE}`
            },
            {
              name: LIBRARY_STRIP_HTML_FROM_METADATA,
              value: `${LIBRARY_STRIP_HTML_FROM_METADATA_STATE}`
            }
          ]
        })
      );
    });
  });

  describe('purging the library', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onPurge();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(purgeLibrary());
    });
  });
});
