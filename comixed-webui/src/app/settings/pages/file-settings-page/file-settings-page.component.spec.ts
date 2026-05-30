/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import FileSettingsPageComponent from './file-settings-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  initialState as initialConfigurationOptionsState
} from '@app/settings/reducers/configuration-option-list.reducer';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { saveConfigurationOptions } from '@app/settings/actions/save-configuration-options.actions';
import {
  BATCH_COMIC_LOCK,
  BLOCKED_PAGES_ENABLED,
  CREATE_EXTERNAL_METADATA_FILES,
  LIBRARY_DELETE_EMPTY_DIRECTORIES,
  LIBRARY_DELETE_PURGED_COMIC_FILES,
  LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
  LIBRARY_FILE_NAMING_RULE,
  LIBRARY_NO_RECREATE_COMICS,
  LIBRARY_PAGE_RENAMING_RULE,
  LIBRARY_ROOT_DIRECTORY,
  LIBRARY_STRIP_HTML_FROM_METADATA,
  SKIP_INTERNAL_METADATA_FILES
} from '@app/settings/settings.constants';
import { TitleService } from '@app/core/services/title.service';

describe('FileSettingsPageComponent', () => {
  const TEST_ROOT_DIRECTORY = '/home/comixed/library';
  const TEST_FILE_NAMING_RULE =
    '$PUBLISHER/$SERIES/$VOLUME/$SERIES V$VOLUME #$ISSUENUMBER ($COVERDATE)';
  const TEST_PAGE_NAMING_RULE = 'page-$INDEX';
  const initialState = {
    [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: initialConfigurationOptionsState
  };

  let component: FileSettingsPageComponent;
  let fixture: ComponentFixture<FileSettingsPageComponent>;
  let translationService: TranslateService;
  let titleService: TitleService;
  let store: MockStore;
  let confirmationService: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FileSettingsPageComponent,
        LoggerModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        TitleService,
        provideMockStore({ initialState }),
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileSettingsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    translationService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('contains the configuration options', () => {
    expect(component.options).not.toBeNull();
  });

  describe('changing the language', () => {
    beforeEach(() => {
      translationService.use('fr');
    });

    it('sets the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(confirmation =>
        confirmation.confirm()
      );
      component.options = [
        { name: LIBRARY_ROOT_DIRECTORY, value: TEST_ROOT_DIRECTORY },
        { name: LIBRARY_FILE_NAMING_RULE, value: TEST_FILE_NAMING_RULE },
        { name: LIBRARY_PAGE_RENAMING_RULE, value: TEST_PAGE_NAMING_RULE },
        { name: LIBRARY_DELETE_PURGED_COMIC_FILES, value: 'true' },
        { name: LIBRARY_STRIP_HTML_FROM_METADATA, value: 'false' },
        { name: LIBRARY_DELETE_EMPTY_DIRECTORIES, value: 'true' },
        { name: LIBRARY_DONT_MOVE_UNSCRAPED_COMICS, value: 'false' },
        { name: CREATE_EXTERNAL_METADATA_FILES, value: 'true' },
        { name: LIBRARY_NO_RECREATE_COMICS, value: 'false' },
        { name: SKIP_INTERNAL_METADATA_FILES, value: 'true' },
        { name: BLOCKED_PAGES_ENABLED, value: 'false' },
        { name: BATCH_COMIC_LOCK, value: 'true' }
      ];
      component.onSubmitChanges();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveConfigurationOptions({
          options: [
            { name: LIBRARY_ROOT_DIRECTORY, value: TEST_ROOT_DIRECTORY },
            { name: LIBRARY_FILE_NAMING_RULE, value: TEST_FILE_NAMING_RULE },
            { name: LIBRARY_PAGE_RENAMING_RULE, value: TEST_PAGE_NAMING_RULE },
            { name: LIBRARY_DELETE_PURGED_COMIC_FILES, value: 'true' },
            { name: LIBRARY_STRIP_HTML_FROM_METADATA, value: 'false' },
            { name: LIBRARY_DELETE_EMPTY_DIRECTORIES, value: 'true' },
            { name: LIBRARY_DONT_MOVE_UNSCRAPED_COMICS, value: 'false' },
            { name: CREATE_EXTERNAL_METADATA_FILES, value: 'true' },
            { name: LIBRARY_NO_RECREATE_COMICS, value: 'false' },
            { name: SKIP_INTERNAL_METADATA_FILES, value: 'true' },
            { name: BLOCKED_PAGES_ENABLED, value: 'false' },
            { name: BATCH_COMIC_LOCK, value: 'true' }
          ]
        })
      );
    });
  });
});
