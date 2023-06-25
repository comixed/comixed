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

import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { getUserPreference } from '@app/user';
import {
  IMPORT_MAXIMUM_RESULTS_DEFAULT,
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_DEFAULT,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';
import {
  clearComicFileSelections,
  loadComicFiles
} from '@app/comic-files/actions/comic-file-list.actions';
import { sendComicFiles } from '@app/comic-files/actions/import-comic-files.actions';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { User } from '@app/user/models/user';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@tragically-slick/confirmation';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_PREFERENCE
} from '@app/core';

@Component({
  selector: 'cx-comic-file-toolbar',
  templateUrl: './comic-file-toolbar.component.html',
  styleUrls: ['./comic-file-toolbar.component.scss']
})
export class ComicFileToolbarComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() comicFiles: ComicFile[] = [];
  @Input() selectedComicFiles: ComicFile[] = [];
  @Input() pageSize = PAGE_SIZE_DEFAULT;

  @Output() selectAll = new EventEmitter<void>();

  loadFilesForm: UntypedFormGroup;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  maximumOptions = [
    { label: 'comic-files.label.maximum-all-files', value: 0 },
    { label: 'comic-files.label.maximum-10-files', value: 10 },
    { label: 'comic-files.label.maximum-50-files', value: 50 },
    { label: 'comic-files.label.maximum-100-files', value: 100 },
    { label: 'comic-files.label.maximum-1000-files', value: 1000 }
  ];
  showLookupForm = true;

  constructor(
    private logger: LoggerService,
    private formBuilder: UntypedFormBuilder,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.loadFilesForm = this.formBuilder.group({
      rootDirectory: ['', Validators.required],
      maximum: ['', Validators.required]
    });
  }

  @Input() set user(user: User) {
    this.logger.debug('Loading import toolbar from user:', user);
    this.loadFilesForm.controls.rootDirectory.setValue(
      getUserPreference(
        user.preferences,
        IMPORT_ROOT_DIRECTORY_PREFERENCE,
        IMPORT_ROOT_DIRECTORY_DEFAULT
      )
    );
    this.loadFilesForm.controls.maximum.setValue(
      parseInt(
        getUserPreference(
          user.preferences,
          IMPORT_MAXIMUM_RESULTS_PREFERENCE,
          `${IMPORT_MAXIMUM_RESULTS_DEFAULT}`
        ),
        10
      )
    );
  }

  @HostListener('window:keydown.shift.control.f', ['$event'])
  onHotkeyLoadFiles(event: KeyboardEvent): void {
    this.logger.debug('Loading files from hotkey');
    event.preventDefault();
    this.doLoadFiles();
  }

  onLoadFiles(): void {
    this.logger.debug('Loading files from button');
    this.doLoadFiles();
  }

  @HostListener('window:keydown.control.a', ['$event'])
  onHotkeySelectAll(event: KeyboardEvent): void {
    this.logger.debug('Select all comic files from hotkey');
    event.preventDefault();
    this.doSelectAll();
  }

  onSelectAll(): void {
    this.logger.debug('Firing event: select all');
    this.doSelectAll();
  }

  @HostListener('window:keydown.shift.control.a', ['$event'])
  onHotkeyDeselectAll(event: KeyboardEvent): void {
    this.logger.debug('Deslecting all from hotkey');
    event.preventDefault();
    this.doDeselectAll();
  }

  onDeselectAll(): void {
    this.logger.debug('Deselecting all comic files');
    this.doDeselectAll();
  }

  @HostListener('window:keydown.control.i', ['$event'])
  onHotkeyStartImport(event: KeyboardEvent): void {
    this.logger.debug('Starting import from hotkey');
    event.preventDefault();
    this.doStartImport();
  }

  onStartImport(): void {
    this.logger.debug('Starting import from button');
    this.doStartImport();
  }

  onToggleFileLookupForm(): void {
    this.showLookupForm = !this.showLookupForm;
  }

  onPageSizeChange(pageSize: number): void {
    this.logger.debug('Page size changed');
    this.store.dispatch(
      saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${pageSize}`
      })
    );
  }

  private doStartImport(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-files.import-comic-files.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-files.import-comic-files.confirmation-message',
        { count: this.selectedComicFiles.length }
      ),
      confirm: () => {
        this.logger.debug('Starting the import process');
        this.store.dispatch(
          sendComicFiles({
            files: this.selectedComicFiles
          })
        );
      }
    });
  }

  private doDeselectAll(): void {
    this.store.dispatch(clearComicFileSelections());
  }

  private doLoadFiles(): void {
    this.store.dispatch(
      loadComicFiles({
        directory: this.loadFilesForm.controls.rootDirectory.value,
        maximum: this.loadFilesForm.controls.maximum.value
      })
    );
  }

  private doSelectAll(): void {
    this.selectAll.emit();
  }
}
