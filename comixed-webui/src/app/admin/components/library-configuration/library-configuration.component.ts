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

import { Component, inject, Input } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ListItem } from '@app/core/models/ui/list-item';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ConfigurationOption } from '@app/admin/models/configuration-option';
import { getConfigurationOption } from '@app/admin';
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
import { ConfirmationService } from '@tragically-slick/confirmation';
import { purgeLibrary } from '@app/library/actions/purge-library.actions';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'cx-library-configuration',
  templateUrl: './library-configuration.component.html',
  styleUrls: ['./library-configuration.component.scss'],
  imports: [
    MatFabButton,
    MatTooltip,
    MatIcon,
    ReactiveFormsModule,
    MatCheckbox,
    MatFormField,
    MatInput,
    MatError,
    TranslateModule
  ]
})
export class LibraryConfigurationComponent {
  @Input() libraryConfigurationForm: UntypedFormGroup;

  readonly comicVariableOptions: ListItem<string>[] = [
    {
      label: '$PUBLISHER',
      value: 'configuration.text.comic-renaming-rule-publisher'
    },
    {
      label: '$IMPRINT',
      value: 'configuration.text.comic-renaming-rule-imprint'
    },
    {
      label: '$SERIES',
      value: 'configuration.text.comic-renaming-rule-series'
    },
    {
      label: '$VOLUME',
      value: 'configuration.text.comic-renaming-rule-volume'
    },
    {
      label: '$ISSUE',
      value: 'configuration.text.comic-renaming-rule-issue-number'
    },
    {
      label: '$ISSUE(8)',
      value: 'configuration.text.comic-renaming-rule-issue-number-with-length'
    },
    {
      label: '$TITLE',
      value: 'configuration.text.comic-renaming-rule-title'
    },
    {
      label: '$COVERDATE',
      value: 'configuration.text.comic-renaming-rule-cover-date'
    },
    {
      label: '$PUBYEAR',
      value: 'configuration.text.comic-renaming-rule-published-year'
    }
  ];
  readonly pageVariableOptions: ListItem<string>[] = [
    { label: '$INDEX', value: 'configuration.text.page-renaming-rule-index' }
  ];

  logger = inject(LoggerService);
  formBuilder = inject(UntypedFormBuilder);
  store = inject(Store<any>);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);

  constructor() {
    this.libraryConfigurationForm = this.formBuilder.group({
      deletePurgedComicFilesDirectories: ['', []],
      deleteEmptyDirectories: ['', []],
      dontMoveUnscrapedComics: ['', []],
      createExternalMetadataFile: ['', []],
      skipInternalMetadataFile: ['', []],
      blockedPagesEnabled: ['', []],
      rootDirectory: ['', [Validators.required]],
      comicRenamingRule: ['', []],
      noRecreateComics: ['', []],
      pageRenamingRule: ['', []],
      stripHtmlFromMetadata: ['', []]
    });
  }

  @Input() set options(options: ConfigurationOption[]) {
    this.logger.debug('Loading configuration options');
    this.libraryConfigurationForm.controls.rootDirectory.setValue(
      getConfigurationOption(options, LIBRARY_ROOT_DIRECTORY, '')
    );
    this.libraryConfigurationForm.controls.comicRenamingRule.setValue(
      getConfigurationOption(options, LIBRARY_COMIC_RENAMING_RULE, '')
    );
    this.libraryConfigurationForm.controls.pageRenamingRule.setValue(
      getConfigurationOption(options, LIBRARY_PAGE_RENAMING_RULE, '')
    );
    this.libraryConfigurationForm.controls.stripHtmlFromMetadata.setValue(
      getConfigurationOption(options, LIBRARY_STRIP_HTML_FROM_METADATA, '')
    );
    this.libraryConfigurationForm.controls.deletePurgedComicFilesDirectories.setValue(
      getConfigurationOption(
        options,
        LIBRARY_DELETE_PURGED_COMIC_FILES,
        `${false}`
      ) === `${true}`
    );
    this.libraryConfigurationForm.controls.deleteEmptyDirectories.setValue(
      getConfigurationOption(
        options,
        LIBRARY_DELETE_EMPTY_DIRECTORIES,
        `${false}`
      ) === `${true}`
    );
    this.libraryConfigurationForm.controls.dontMoveUnscrapedComics.setValue(
      getConfigurationOption(
        options,
        LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
        `${false}`
      ) === `${true}`
    );
    this.libraryConfigurationForm.controls.createExternalMetadataFile.setValue(
      getConfigurationOption(
        options,
        CREATE_EXTERNAL_METADATA_FILES,
        `${false}`
      ) === `${true}`
    );
    this.libraryConfigurationForm.controls.noRecreateComics.setValue(
      getConfigurationOption(
        options,
        LIBRARY_NO_RECREATE_COMICS,
        `${false}`
      ) === `${true}`
    );
    this.libraryConfigurationForm.controls.skipInternalMetadataFile.setValue(
      getConfigurationOption(
        options,
        SKIP_INTERNAL_METADATA_FILES,
        `${false}`
      ) === `${true}`
    );
    this.libraryConfigurationForm.controls.blockedPagesEnabled.setValue(
      getConfigurationOption(options, BLOCKED_PAGES_ENABLED, `${false}`) ===
        `${true}`
    );
    this.libraryConfigurationForm.controls.stripHtmlFromMetadata.setValue(
      getConfigurationOption(
        options,
        LIBRARY_STRIP_HTML_FROM_METADATA,
        `${false}`
      ) === `${true}`
    );
  }

  onSave(): void {
    this.logger.debug('Save configuration called');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'save-configuration.confirmation-title'
      ),
      message: this.translateService.instant(
        'save-configuration.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Save configuration confirmed');
        this.store.dispatch(
          saveConfigurationOptions({ options: this.encodeOptions() })
        );
      }
    });
  }

  onPurge(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'configuration.purge-library.confirmation-title'
      ),
      message: this.translateService.instant(
        'configuration.purge-library.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Purging library...');
        this.store.dispatch(purgeLibrary());
      }
    });
  }

  private encodeOptions(): ConfigurationOption[] {
    return [
      {
        name: LIBRARY_DELETE_PURGED_COMIC_FILES,
        value: `${this.libraryConfigurationForm.controls.deletePurgedComicFilesDirectories.value}`
      },
      {
        name: LIBRARY_DELETE_EMPTY_DIRECTORIES,
        value: `${this.libraryConfigurationForm.controls.deleteEmptyDirectories.value}`
      },
      {
        name: LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
        value: `${this.libraryConfigurationForm.controls.dontMoveUnscrapedComics.value}`
      },
      {
        name: CREATE_EXTERNAL_METADATA_FILES,
        value: `${this.libraryConfigurationForm.controls.createExternalMetadataFile.value}`
      },
      {
        name: SKIP_INTERNAL_METADATA_FILES,
        value: `${this.libraryConfigurationForm.controls.skipInternalMetadataFile.value}`
      },
      {
        name: LIBRARY_NO_RECREATE_COMICS,
        value: `${this.libraryConfigurationForm.controls.noRecreateComics.value}`
      },
      {
        name: LIBRARY_ROOT_DIRECTORY,
        value: this.libraryConfigurationForm.controls.rootDirectory.value
      },
      {
        name: LIBRARY_COMIC_RENAMING_RULE,
        value: this.libraryConfigurationForm.controls.comicRenamingRule.value
      },
      {
        name: LIBRARY_PAGE_RENAMING_RULE,
        value: this.libraryConfigurationForm.controls.pageRenamingRule.value
      },
      {
        name: BLOCKED_PAGES_ENABLED,
        value: `${this.libraryConfigurationForm.controls.blockedPagesEnabled.value}`
      },
      {
        name: LIBRARY_STRIP_HTML_FROM_METADATA,
        value: `${this.libraryConfigurationForm.controls.stripHtmlFromMetadata.value}`
      }
    ];
  }
}
