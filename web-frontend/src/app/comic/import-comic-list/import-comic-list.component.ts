/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators, AbstractControl} from '@angular/forms';

import {FileDetails} from '../file-details.model';
import {ComicService} from '../comic.service';
import {AlertService} from '../../alert.service';
import {ImportComicListEntryComponent} from '../import-comic-list-entry/import-comic-list-entry.component';

@Component({
  selector: 'app-import-comics',
  templateUrl: './import-comic-list.component.html',
  styleUrls: ['./import-comic-list.component.css']
})
export class ImportComicListComponent implements OnInit {
  directoryForm: FormGroup;
  directory: AbstractControl;
  files: FileDetails[];
  importing = false;
  plural = true;
  busy = false;
  busy_title: string;
  display = 'none';
  pending_imports = 0;
  waiting_on_imports = false;
  cover_size: number;
  current_page = 1;
  selected_file_count = 0;
  show_selections_only = false;

  constructor(
    private comic_service: ComicService,
    private alert_service: AlertService,
    builder: FormBuilder,
  ) {
    this.directoryForm = builder.group({'directory': ['', Validators.required]});
    this.directory = this.directoryForm.controls['directory'];
  }

  ngOnInit() {
    const that = this;
    setInterval(() => {
      // don't try to get the pending imports if we're already doing it...
      if (that.waiting_on_imports === true) {
        return;
      }
      that.waiting_on_imports = true;
      that.comic_service.get_number_of_pending_imports().subscribe(
        count => {
          that.pending_imports = count;
          if (count > 0) {
            that.busy_title = 'Importing ' + count + ' More Comic' + (that.plural ? 's' : '') + '...';
            that.importing = true;
          } else {
            that.importing = false;
          }
        },
        error => {
          that.alert_service.show_error_message('Error getting the number of pending imports...', error);
          that.importing = false;
        },
        () => {
          that.waiting_on_imports = false;
        });
    }, 250);
    this.comic_service.get_user_preference('cover_size').subscribe(
      (cover_size: number) => {
        this.cover_size = cover_size || 64;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Error loading user preference: cover_size', error);
      }
    );
  }

  on_load(): void {
    const that = this;
    this.busy_title = 'Fetching List Of Comic Files...';
    this.busy = true;
    const directory = this.directory.value;
    this.comic_service.get_files_under_directory(directory).subscribe(
      files => {
        that.files = files;
        that.plural = this.files.length !== 1;
        that.selected_file_count = 0;
      },
      error => {
        that.alert_service.show_error_message('Error while loading filenames...', error);
      },
      () => {
        that.busy = false;
      }
    );
  }

  toggle_comic_selection(file: FileDetails): void {
    file.selected = !file.selected;
    if (file.selected) {
      this.selected_file_count = this.selected_file_count + 1;
    } else {
      this.selected_file_count = this.selected_file_count - 1;
    }
  }

  select_all_files(): void {
    this.files.forEach((file) => {
      file.selected = true;
    });
    this.selected_file_count = this.files.length;
  }

  import_selected_files(): void {
    const that = this;
    this.importing = true;
    const selectedFiles = this.files.filter(file => file.selected).map(file => file.filename);
    this.comic_service.import_files_into_library(selectedFiles).subscribe(
      () => {},
      error => {
        this.alert_service.show_error_message('Failed to get the list of files...', error);
        that.importing = false;
      }
    );
  }
}
