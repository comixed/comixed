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

import { Component, inject, signal } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Card } from '@openng/optimus-ui/card';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { ConfirmationService, MenuItem } from '@openng/optimus-ui/api';
import { TitleService } from '@app/layout/services/title-service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { Button } from '@openng/optimus-ui/button';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { TableModule } from '@openng/optimus-ui/table';
import { DecimalPipe } from '@angular/common';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { ComicFile } from '@app/library/models/comic-file';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Store } from '@ngrx/store';
import { ComicFileListActions } from '@app/library/actions/comic-file-list.actions';
import {
  selectComicFileCount,
  selectComicFileList,
  selectComicFileSelectedCount
} from '@app/library/selectors/comic-file-list.selectors';
import selectUserState from '@app/account/selectors/user.selectors';
import {
  IMPORT_ROOT_DIRECTORY_DEFAULT,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/account/user-preferences';
import { getUserPreference } from '@app/account/account-functions';

interface MaximumOption {
  label: string;
  value: number;
}

@Component({
  imports: [
    Card,
    TranslatePipe,
    Breadcrumb,
    ReactiveFormsModule,
    InputText,
    Select,
    Button,
    InputGroup,
    FormsModule,
    TableModule,
    DecimalPipe,
    Checkbox,
    Tooltip
  ],
  selector: 'app-import-comics-page',
  styleUrl: './import-comics-page.scss',
  templateUrl: './import-comics-page.html'
})
export class ImportComicsPage {
  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  importComicsForm!: FormGroup;
  maximumOptions: MaximumOption[] = [];
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly store = inject(Store);
  readonly confirmationService = inject(ConfirmationService);
  readonly comicFileList = this.store.selectSignal(selectComicFileList);
  readonly comicFileCount = this.store.selectSignal(selectComicFileCount);
  readonly comicFileSelectedCount = this.store.selectSignal(
    selectComicFileSelectedCount
  );
  readonly formBuilder = inject(FormBuilder);
  readonly trail = signal<MenuItem[]>([]);

  constructor() {
    this.logger.trace('Loading comic files from the session');
    this.store.dispatch(ComicFileListActions.loadFromSession());
    this.logger.trace('Creating import comics form');
    this.importComicsForm = this.formBuilder.group({
      directory: new FormControl<string>(''),
      maximum: new FormControl<number>(0)
    });
    this.logger.trace('Subscribing to user updates');
    this.store.select(selectUserState).subscribe({
      next: state => {
        if (state && state.user) {
          this.importComicsForm.controls['directory'].setValue(
            getUserPreference(
              state.user!,
              IMPORT_ROOT_DIRECTORY_PREFERENCE,
              IMPORT_ROOT_DIRECTORY_DEFAULT
            )
          );
        }
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  onLoadComicFiles(): void {
    this.logger.trace('Loading comics files');
    const directory = this.importComicsForm.controls['directory'].value;
    const maximum = this.importComicsForm.controls['maximum'].value;
    this.store.dispatch(
      ComicFileListActions.loadFromDisk({ directory, maximum })
    );
  }

  onSelectComicFile(file: ComicFile, selected: boolean) {
    this.logger.debug('Toggling file selected:', file, selected);
    this.store.dispatch(
      ComicFileListActions.select({
        filename: file.filename,
        selected,
        single: true
      })
    );
  }

  onSelectAll(selected: boolean) {
    this.logger.debug('Toggling all files selected:', selected);
    this.store.dispatch(
      ComicFileListActions.select({
        filename: '',
        selected,
        single: false
      })
    );
  }

  onImportComicFiles() {
    this.confirmationService.confirm({
      message: this.translateService.instant(
        'import-comics-page.import-comic-files.confirmation-message'
      ),
      header: this.translateService.instant(
        'import-comics-page.import-comic-files.confirmation-title'
      ),
      rejectButtonProps: {
        label: this.translateService.instant('app.button.cancel'),
        severity: 'danger'
      },
      acceptButtonProps: {
        label: this.translateService.instant('app.button.confirm'),
        severity: 'primary'
      },
      accept: () => {
        this.logger.debug('Starting to import the selecting comics');
        this.store.dispatch(ComicFileListActions.import());
      }
    });
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('import-comics-page.page-title')
    );
    this.trail.set([
      { label: this.translateService.instant('import-comics-page.page-title') }
    ]);
    this.maximumOptions = [
      {
        label: this.translateService.instant(
          'import-comics-page.label.all-comics'
        ),
        value: 0
      },
      {
        label: this.translateService.instant(
          'import-comics-page.label.10-comics'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'import-comics-page.label.25-comics'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'import-comics-page.label.50-comics'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'import-comics-page.label.100-comics'
        ),
        value: 100
      },
      {
        label: this.translateService.instant(
          'import-comics-page.label.1000-comics'
        ),
        value: 1000
      }
    ];
  }
}
