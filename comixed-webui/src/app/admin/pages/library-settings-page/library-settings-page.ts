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

import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { Card } from '@openng/optimus-ui/card';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TitleService } from '@app/layout/services/title-service';
import { Store } from '@ngrx/store';
import {
  selectConfigurationBusy,
  selectConfigurationEntries
} from '@app/settings/selectors/configuration.selectors';
import { ConfigurationActions } from '@app/settings/actions/configuration.actions';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { Button } from '@openng/optimus-ui/button';
import { ConfigurationOption } from '@app/settings/models/configuration-option';
import {
  BATCH_COMIC_LOCK,
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
} from '@app/admin/admin-configuration-options';
import { TableModule } from '@openng/optimus-ui/table';
import { ListItem } from '@app/admin/models/list-item';
import { Skeleton } from '@openng/optimus-ui/skeleton';

@Component({
  imports: [
    Card,
    Breadcrumb,
    TranslatePipe,
    ReactiveFormsModule,
    Checkbox,
    Button,
    TableModule,
    Skeleton
  ],
  selector: 'app-library-settings-page',
  styleUrl: './library-settings-page.scss',
  templateUrl: './library-settings-page.html'
})
export class LibrarySettingsPage implements AfterViewInit {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly store = inject(Store);
  readonly formBuilder = inject(FormBuilder);

  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  readonly trail = signal<MenuItem[]>([]);
  readonly configurationOptionsBusy = this.store.selectSignal(
    selectConfigurationBusy
  );
  readonly comicVariableOptions: ListItem<string>[] = [
    {
      label: '$PUBLISHER',
      value: 'library-settings-page.variable.comic-renaming-rule-publisher'
    },
    {
      label: '$IMPRINT',
      value: 'library-settings-page.variable.comic-renaming-rule-imprint'
    },
    {
      label: '$SERIES',
      value: 'library-settings-page.variable.comic-renaming-rule-series'
    },
    {
      label: '$VOLUME',
      value: 'library-settings-page.variable.comic-renaming-rule-volume'
    },
    {
      label: '$ISSUE',
      value: 'library-settings-page.variable.comic-renaming-rule-issue-number'
    },
    {
      label: '$ISSUE(8)',
      value:
        'library-settings-page.variable.comic-renaming-rule-issue-number-with-length'
    },
    {
      label: '$TITLE',
      value: 'library-settings-page.variable.comic-renaming-rule-title'
    },
    {
      label: '$COVERDATE',
      value: 'library-settings-page.variable.comic-renaming-rule-cover-date'
    },
    {
      label: '$PUBYEAR',
      value: 'library-settings-page.variable.comic-renaming-rule-published-year'
    },
    {
      label: '$INDEX',
      value: 'library-settings-page.variable.page-renaming-rule-index'
    }
  ];

  configurationForm: FormGroup;

  constructor() {
    this.configurationForm = this.formBuilder.group({
      rootDirectory: new FormControl(''),
      comicRenamingRule: new FormControl(''),
      pageRenamingRule: new FormControl(''),
      deleteWhenPurging: new FormControl(false),
      deleteEmptyDirectories: new FormControl(false),
      ignoreUnscrapedComics: new FormControl(false),
      createExternalMetadata: new FormControl(false),
      doNotUpdateInternalMetadata: new FormControl(false),
      doNotRecreateArchives: new FormControl(false),
      manageBlockedPages: new FormControl(false),
      stripHtmlFromMetadata: new FormControl(false),
      exclusiveBatchAccess: new FormControl(false)
    });
    this.store
      .select(selectConfigurationEntries)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: options => (this.options = options)
      });
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe({ next: () => this.doLoadTranslations() });
    this.doLoadTranslations();
  }

  private _options: ConfigurationOption[] = [];

  get options(): ConfigurationOption[] {
    return this._options;
  }

  set options(options: ConfigurationOption[]) {
    this._options = options;
    this.doLoadForm();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(ConfigurationActions.load());
  }

  onSaveSettings(): void {
    this.store.dispatch(
      ConfigurationActions.save({ entries: this.doEncodeForm() })
    );
  }

  onResetChanges() {
    this.logger.debug('Resetting configuration changes');
    this.doLoadForm();
  }

  private doLoadForm() {
    this.configurationForm.controls['rootDirectory'].setValue(
      this.options.find(entry => entry.name === LIBRARY_ROOT_DIRECTORY)
        ?.value || ''
    );
    this.configurationForm.controls['comicRenamingRule'].setValue(
      this.options.find(entry => entry.name === LIBRARY_COMIC_RENAMING_RULE)
        ?.value || ''
    );
    this.configurationForm.controls['pageRenamingRule'].setValue(
      this.options.find(entry => entry.name === LIBRARY_PAGE_RENAMING_RULE)
        ?.value || ''
    );
    this.configurationForm.controls['deleteWhenPurging'].setValue(
      `${true}` ===
        this.options.find(
          entry => entry.name === LIBRARY_DELETE_PURGED_COMIC_FILES
        )?.value
    );
    this.configurationForm.controls['deleteEmptyDirectories'].setValue(
      `${true}` ===
        this.options.find(
          entry => entry.name === LIBRARY_DELETE_EMPTY_DIRECTORIES
        )?.value
    );
    this.configurationForm.controls['ignoreUnscrapedComics'].setValue(
      `${true}` ===
        this.options.find(
          entry => entry.name === LIBRARY_DONT_MOVE_UNSCRAPED_COMICS
        )?.value
    );
    this.configurationForm.controls['createExternalMetadata'].setValue(
      `${true}` ===
        this.options.find(
          entry => entry.name === CREATE_EXTERNAL_METADATA_FILES
        )?.value
    );
    this.configurationForm.controls['doNotUpdateInternalMetadata'].setValue(
      `${true}` ===
        this.options.find(entry => entry.name === SKIP_INTERNAL_METADATA_FILES)
          ?.value
    );
    this.configurationForm.controls['doNotRecreateArchives'].setValue(
      `${true}` ===
        this.options.find(entry => entry.name === LIBRARY_NO_RECREATE_COMICS)
          ?.value
    );
    this.configurationForm.controls['manageBlockedPages'].setValue(
      `${true}` ===
        this.options.find(entry => entry.name === BLOCKED_PAGES_ENABLED)?.value
    );
    this.configurationForm.controls['stripHtmlFromMetadata'].setValue(
      `${true}` ===
        this.options.find(
          entry => entry.name === LIBRARY_STRIP_HTML_FROM_METADATA
        )?.value
    );
    this.configurationForm.controls['exclusiveBatchAccess'].setValue(
      `${true}` ===
        this.options.find(entry => entry.name === BATCH_COMIC_LOCK)?.value
    );
    this.configurationForm.markAsPristine();
    this.configurationForm.markAsUntouched();
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('library-settings-page.page-title')
    );
    this.trail.set([
      {
        label: this.translateService.instant('settings.trail-title')
      },
      {
        label: this.translateService.instant(
          'library-settings-page.trail-title'
        )
      }
    ]);
  }

  private doEncodeForm(): ConfigurationOption[] {
    return [
      this.doEncodeInput(
        LIBRARY_ROOT_DIRECTORY,
        this.configurationForm.controls['rootDirectory']
      ),
      this.doEncodeInput(
        LIBRARY_COMIC_RENAMING_RULE,
        this.configurationForm.controls['comicRenamingRule']
      ),
      this.doEncodeInput(
        LIBRARY_PAGE_RENAMING_RULE,
        this.configurationForm.controls['pageRenamingRule']
      ),
      this.doEncodeInput(
        LIBRARY_DELETE_PURGED_COMIC_FILES,
        this.configurationForm.controls['deleteWhenPurging']
      ),
      this.doEncodeInput(
        LIBRARY_DELETE_EMPTY_DIRECTORIES,
        this.configurationForm.controls['deleteEmptyDirectories']
      ),
      this.doEncodeInput(
        LIBRARY_DONT_MOVE_UNSCRAPED_COMICS,
        this.configurationForm.controls['ignoreUnscrapedComics']
      ),
      this.doEncodeInput(
        CREATE_EXTERNAL_METADATA_FILES,
        this.configurationForm.controls['createExternalMetadata']
      ),
      this.doEncodeInput(
        SKIP_INTERNAL_METADATA_FILES,
        this.configurationForm.controls['doNotUpdateInternalMetadata']
      ),
      this.doEncodeInput(
        LIBRARY_NO_RECREATE_COMICS,
        this.configurationForm.controls['doNotRecreateArchives']
      ),
      this.doEncodeInput(
        BLOCKED_PAGES_ENABLED,
        this.configurationForm.controls['manageBlockedPages']
      ),
      this.doEncodeInput(
        LIBRARY_STRIP_HTML_FROM_METADATA,
        this.configurationForm.controls['stripHtmlFromMetadata']
      ),
      this.doEncodeInput(
        BATCH_COMIC_LOCK,
        this.configurationForm.controls['exclusiveBatchAccess']
      )
    ];
  }

  private doEncodeInput(
    name: string,
    control: AbstractControl<unknown>
  ): ConfigurationOption {
    return {
      name,
      value: control.value !== null ? `${control.value}` : ''
    };
  }
}
