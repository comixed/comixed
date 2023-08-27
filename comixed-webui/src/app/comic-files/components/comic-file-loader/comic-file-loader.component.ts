/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@app/user/models/user';
import { getUserPreference } from '@app/user';
import {
  IMPORT_MAXIMUM_RESULTS_DEFAULT,
  IMPORT_MAXIMUM_RESULTS_PREFERENCE,
  IMPORT_ROOT_DIRECTORY_DEFAULT,
  IMPORT_ROOT_DIRECTORY_PREFERENCE
} from '@app/library/library.constants';
import { loadComicFiles } from '@app/comic-files/actions/comic-file-list.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'cx-comic-file-loader',
  templateUrl: './comic-file-loader.component.html',
  styleUrls: ['./comic-file-loader.component.scss']
})
export class ComicFileLoaderComponent {
  loadFilesForm: FormGroup;
  readonly maximumOptions = [
    { label: 'comic-files.label.maximum-all-files', value: 0 },
    { label: 'comic-files.label.maximum-10-files', value: 10 },
    { label: 'comic-files.label.maximum-50-files', value: 50 },
    { label: 'comic-files.label.maximum-100-files', value: 100 },
    { label: 'comic-files.label.maximum-1000-files', value: 1000 }
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

  onLoadFiles() {
    this.store.dispatch(
      loadComicFiles({
        directory: this.loadFilesForm.controls.rootDirectory.value,
        maximum: this.loadFilesForm.controls.maximum.value
      })
    );
  }
}
