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

import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { loadComicFiles } from '@app/comic-import/actions/comic-import.actions';
import { selectUser } from '@app/user/selectors/user.selectors';
import { Subscription } from 'rxjs';
import { getUserPreference } from '@app/user';
import {
  USER_PREFERENCE_IMPORT_MAXIMUM,
  USER_PREFERENCE_IMPORT_ROOT_DIRECTORY,
} from '@app/user/user.constants';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cx-import-toolbar',
  templateUrl: './import-toolbar.component.html',
  styleUrls: ['./import-toolbar.component.scss'],
})
export class ImportToolbarComponent implements OnInit {
  loadFilesForm: FormGroup;
  userSubscription: Subscription;

  const;
  maximumOptions = [
    { label: 'load-comic-files.maximum.all-files', value: 0 },
    { label: 'load-comic-files.maximum.10-files', value: 10 },
    { label: 'load-comic-files.maximum.50-files', value: 50 },
    { label: 'load-comic-files.maximum.100-files', value: 100 },
    { label: 'load-comic-files.maximum.1000-files', value: 1000 },
  ];

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private store: Store<any>
  ) {
    this.loadFilesForm = this.formBuilder.group({
      directory: ['', Validators.required],
      maximum: ['', Validators.required],
    });
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(filter((user) => !!user))
      .subscribe((user) => {
        this.controls.directory.setValue(
          getUserPreference(
            user.preferences,
            USER_PREFERENCE_IMPORT_ROOT_DIRECTORY,
            ''
          )
        );
        this.controls.maximum.setValue(
          parseInt(
            getUserPreference(
              user.preferences,
              USER_PREFERENCE_IMPORT_MAXIMUM,
              '0'
            ),
            10
          )
        );
      });
  }

  ngOnInit(): void {}

  get controls(): { [p: string]: AbstractControl } {
    return this.loadFilesForm.controls;
  }

  set directory(directory: string) {
    this.controls.directory.setValue(directory);
  }

  get directory(): string {
    return this.controls.directory.value;
  }

  set maximum(maximum: number) {
    this.controls.maximum.setValue(maximum);
  }

  get maximum(): number {
    return this.controls.maximum.value;
  }

  onLoadFiles(): void {
    this.store.dispatch(
      loadComicFiles({
        directory: this.directory,
        maximum: this.maximum,
      })
    );
  }
}
