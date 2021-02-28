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

import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  clearComicFileSelections,
  loadComicFiles,
  sendComicFiles,
  setComicFilesSelectedState
} from '@app/library/actions/comic-import.actions';
import { getUserPreference, User } from '@app/user';
import { ComicFile } from '@app/library';
import {
  IMPORT_MAXIMUM_RESULTS_DEFAULT,
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_DEFAULT,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';

@Component({
  selector: 'cx-comic-file-toolbar',
  templateUrl: './comic-file-toolbar.component.html',
  styleUrls: ['./comic-file-toolbar.component.scss']
})
export class ComicFileToolbarComponent {
  @Input() ignoreMetadata = false;
  @Input() deleteBlockedPages = false;
  @Input() comicFiles: ComicFile[] = [];
  @Input() selectedComicFiles: ComicFile[] = [];

  loadFilesForm: FormGroup;

  const;
  maximumOptions = [
    { label: 'import-comic-files.label.maximum-all-files', value: 0 },
    { label: 'import-comic-files.label.maximum-10-files', value: 10 },
    { label: 'import-comic-files.label.maximum-50-files', value: 50 },
    { label: 'import-comic-files.label.maximum-100-files', value: 100 },
    { label: 'import-comic-files.label.maximum-1000-files', value: 1000 }
  ];

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>
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

  onLoadFiles(): void {
    this.store.dispatch(
      loadComicFiles({
        directory: this.loadFilesForm.controls.rootDirectory.value,
        maximum: this.loadFilesForm.controls.maximum.value
      })
    );
  }

  onSelectAll(): void {
    this.logger.trace('Selecting all comic files');
    this.store.dispatch(
      setComicFilesSelectedState({ files: this.comicFiles, selected: true })
    );
  }

  onDeselectAll(): void {
    this.logger.trace('Deselecting all comic files');
    this.store.dispatch(clearComicFileSelections());
  }

  onToggleIgnoreMetadata(): void {
    this.logger.trace('Setting ignoring metadata to', !this.ignoreMetadata);
    this.ignoreMetadata = this.ignoreMetadata === false;
  }

  onToggleDeleteBlockedPages(): void {
    this.logger.trace(
      'Setting deleting blocked page to',
      !this.deleteBlockedPages
    );
    this.deleteBlockedPages = this.deleteBlockedPages === false;
  }

  onStartImport(): void {
    this.logger.trace('Starting the import process');
    this.store.dispatch(
      sendComicFiles({
        files: this.selectedComicFiles,
        ignoreMetadata: this.ignoreMetadata,
        deleteBlockedPages: this.deleteBlockedPages
      })
    );
  }
}
