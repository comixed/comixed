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
import { ComicFilesStore } from '@app/library/stores/comic-files-store';
import { Card } from '@openng/optimus-ui/card';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { MenuItem } from '@openng/optimus-ui/api';
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
import { ComicFileService } from '@app/library/services/comic-file-service';
import { TableModule } from '@openng/optimus-ui/table';
import { DecimalPipe } from '@angular/common';
import { Checkbox, CheckboxChangeEvent } from '@openng/optimus-ui/checkbox';
import { ComicFile } from '@app/library/models/comic-file';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Skeleton } from '@openng/optimus-ui/skeleton';

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
    Tooltip,
    Skeleton
  ],
  selector: 'app-import-comics-page',
  styleUrl: './import-comics-page.scss',
  templateUrl: './import-comics-page.html'
})
export class ImportComicsPage {
  readonly logger = inject(LoggerService);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly comicFileService = inject(ComicFileService);
  readonly comicFilesStore = inject(ComicFilesStore);
  readonly formBuilder = inject(FormBuilder);
  readonly trail = signal<MenuItem[]>([]);

  home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  importComicsForm!: FormGroup;
  maximumOptions: MaximumOption[] = [];

  constructor() {
    this.comicFileService.loadComicFilesFromSession();
    this.logger.trace('Creating import comics form');
    this.importComicsForm = this.formBuilder.group({
      directory: new FormControl<string>(''),
      maximum: new FormControl<MaximumOption | null>(null)
    });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
    this.doLoadTranslations();
  }

  onLoadComicFiles(): void {
    this.logger.trace('Loading comics files');
    const directory = this.importComicsForm.controls['directory'].value;
    const maximum = this.importComicsForm.controls['maximum'].value!.value;
    this.comicFileService.loadComicFiles({ directory, maximum });
  }

  onSelectComicFile(file: ComicFile, event: CheckboxChangeEvent) {
    this.logger.debug('Toggling file selected:', file, event.checked);
    this.comicFileService.setComicFileSelected({
      filename: file.filename,
      selected: event.checked,
      single: true
    });
  }

  onSelectAll(event: CheckboxChangeEvent) {
    this.logger.debug('Toggling all files selected:', event.checked);
    this.comicFileService.setComicFileSelected({
      filename: '',
      selected: event.checked,
      single: false
    });
  }

  onImportComicFiles() {
    this.logger.debug('Starting to import the selecting comics');
    this.comicFileService.importComicFiles();
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
