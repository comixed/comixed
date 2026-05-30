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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ConfigurationOption } from '@app/settings/models/configuration-option';
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
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton, MatFabButton } from '@angular/material/button';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatIcon } from '@angular/material/icon';
import { ListItem } from '@app/core/models/ui/list-item';
import { selectConfigurationOptions } from '@app/settings/selectors/configuration-option-list.selectors';
import { TitleService } from '@app/core/services/title.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { getConfigurationOption } from '@app/settings';
import { saveConfigurationOptions } from '@app/settings/actions/save-configuration-options.actions';
import { loadConfigurationOptions } from '@app/settings/actions/configuration-option-list.actions';

@Component({
  selector: 'cx-file-settings',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    TranslatePipe,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatLabel,
    MatIcon,
    MatCheckbox,
    MatFabButton
  ],
  templateUrl: './file-settings-page.component.html',
  styleUrl: './file-settings-page.component.scss'
})
class FileSettingsPageComponent implements OnInit {
  logger = inject(LoggerService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  confirmationService = inject(ConfirmationService);
  translationService = inject(TranslateService);
  titleService = inject(TitleService);

  readonly fileNamingRuleOptions: ListItem<string>[] = [
    {
      label: '$PUBLISHER',
      value: 'settings.file-settings.text.comic-renaming-rule-publisher'
    },
    {
      label: '$IMPRINT',
      value: 'settings.file-settings.text.comic-renaming-rule-imprint'
    },
    {
      label: '$SERIES',
      value: 'settings.file-settings.text.comic-renaming-rule-series'
    },
    {
      label: '$VOLUME',
      value: 'settings.file-settings.text.comic-renaming-rule-volume'
    },
    {
      label: '$ISSUE',
      value: 'settings.file-settings.text.comic-renaming-rule-issue-number'
    },
    {
      label: '$ISSUE(8)',
      value:
        'settings.file-settings.text.comic-renaming-rule-issue-number-with-length'
    },
    {
      label: '$TITLE',
      value: 'settings.file-settings.text.comic-renaming-rule-title'
    },
    {
      label: '$COVERDATE',
      value: 'settings.file-settings.text.comic-renaming-rule-cover-date'
    },
    {
      label: '$PUBYEAR',
      value: 'settings.file-settings.text.comic-renaming-rule-published-year'
    }
  ];
  readonly pageNamingRuleOptions: ListItem<string>[] = [
    {
      label: '$INDEX',
      value: 'settings.file-settings.text.page-renaming-rule-index'
    }
  ];

  fileSettingsForm: FormGroup;

  constructor() {
    this.logger.debug('Creating file settings form');
    this.fileSettingsForm = this.formBuilder.group({
      rootDirectory: ['', Validators.required],
      fileNamingRule: ['', Validators.required],
      pageNamingRule: ['', Validators.required],
      deletePurgedComicFiles: [''],
      deleteEmptyDirectories: [''],
      dontMoveUnscrapedFiles: [''],
      createExternalMetadataFiles: [''],
      skipInternalMetadataFiles: [''],
      noRecreateComics: [''],
      blockedPagesEnabled: [''],
      stripHtmlFromMetadata: [''],
      batchComicLock: ['']
    });
    this.logger.debug('Subscribing to configuration option updates');
    this.store
      .select(selectConfigurationOptions)
      .subscribe(options => (this.options = options));
    this.logger.debug('Subscribing to language changes');
    this.translationService.onLangChange.subscribe({
      next: () => this.loadTranslations()
    });
    this.loadTranslations();
  }

  private _options: ConfigurationOption[] = [];

  get options(): ConfigurationOption[] {
    return this._options;
  }

  set options(options: ConfigurationOption[]) {
    this._options = options;
    this.fileSettingsForm.controls['rootDirectory'].setValue(
      options.find(option => option.name === LIBRARY_ROOT_DIRECTORY)?.value ||
        ''
    );
    this.fileSettingsForm.controls['fileNamingRule'].setValue(
      options.find(option => option.name === LIBRARY_FILE_NAMING_RULE)?.value ||
        ''
    );
    this.fileSettingsForm.controls['pageNamingRule'].setValue(
      options.find(option => option.name === LIBRARY_PAGE_RENAMING_RULE)
        ?.value || ''
    );
    this.fileSettingsForm.controls['stripHtmlFromMetadata'].setValue(
      getConfigurationOption(
        options,
        LIBRARY_STRIP_HTML_FROM_METADATA,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['batchComicLock'].setValue(
      getConfigurationOption(options, BATCH_COMIC_LOCK, `${false}`) ===
        `${true}`
    );
    this.fileSettingsForm.controls['deletePurgedComicFiles'].setValue(
      getConfigurationOption(
        options,
        LIBRARY_DELETE_PURGED_COMIC_FILES,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['deleteEmptyDirectories'].setValue(
      getConfigurationOption(
        options,
        LIBRARY_DELETE_EMPTY_DIRECTORIES,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['dontMoveUnscrapedFiles'].setValue(
      getConfigurationOption(
        options,
        LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['createExternalMetadataFiles'].setValue(
      getConfigurationOption(
        options,
        CREATE_EXTERNAL_METADATA_FILES,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['noRecreateComics'].setValue(
      getConfigurationOption(
        options,
        LIBRARY_NO_RECREATE_COMICS,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['skipInternalMetadataFiles'].setValue(
      getConfigurationOption(
        options,
        SKIP_INTERNAL_METADATA_FILES,
        `${false}`
      ) === `${true}`
    );
    this.fileSettingsForm.controls['blockedPagesEnabled'].setValue(
      getConfigurationOption(options, BLOCKED_PAGES_ENABLED, `${false}`) ===
        `${true}`
    );
  }

  ngOnInit(): void {
    this.logger.debug('Loading configuration options');
    this.store.dispatch(loadConfigurationOptions());
  }

  onSubmitChanges() {
    this.confirmationService.confirm({
      title: this.translationService.instant(
        'settings.file-settings.confirmation-title'
      ),
      message: this.translationService.instant(
        'settings.file-settings.confirmation-message'
      ),
      confirm: () => {
        this.store.dispatch(
          saveConfigurationOptions({
            options: [
              {
                name: LIBRARY_ROOT_DIRECTORY,
                value: this.fileSettingsForm.controls['rootDirectory'].value
              },
              {
                name: LIBRARY_FILE_NAMING_RULE,
                value: this.fileSettingsForm.controls['fileNamingRule'].value
              },
              {
                name: LIBRARY_PAGE_RENAMING_RULE,
                value: this.fileSettingsForm.controls['pageNamingRule'].value
              },
              {
                name: LIBRARY_DELETE_PURGED_COMIC_FILES,
                value: `${this.fileSettingsForm.controls['deletePurgedComicFiles'].value}`
              },
              {
                name: LIBRARY_STRIP_HTML_FROM_METADATA,
                value: `${this.fileSettingsForm.controls['stripHtmlFromMetadata'].value}`
              },
              {
                name: LIBRARY_DELETE_EMPTY_DIRECTORIES,
                value: `${this.fileSettingsForm.controls['deleteEmptyDirectories'].value}`
              },
              {
                name: LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
                value: `${this.fileSettingsForm.controls['dontMoveUnscrapedFiles'].value}`
              },
              {
                name: CREATE_EXTERNAL_METADATA_FILES,
                value: `${this.fileSettingsForm.controls['createExternalMetadataFiles'].value}`
              },
              {
                name: LIBRARY_NO_RECREATE_COMICS,
                value: `${this.fileSettingsForm.controls['noRecreateComics'].value}`
              },
              {
                name: SKIP_INTERNAL_METADATA_FILES,
                value: `${this.fileSettingsForm.controls['skipInternalMetadataFiles'].value}`
              },
              {
                name: BLOCKED_PAGES_ENABLED,
                value: `${this.fileSettingsForm.controls['blockedPagesEnabled'].value}`
              },
              {
                name: BATCH_COMIC_LOCK,
                value: `${this.fileSettingsForm.controls['batchComicLock'].value}`
              }
            ]
          })
        );
      }
    });
  }

  private loadTranslations() {
    this.logger.debug('Loading translations');
    this.titleService.setTitle(
      this.translationService.instant('settings.file-settings.tab-title')
    );
  }
}

export default FileSettingsPageComponent;
