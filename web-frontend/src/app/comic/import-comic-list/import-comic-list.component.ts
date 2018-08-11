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

import {SelectedForImportPipe} from './selected-for-import.pipe';

@Component({
  selector: 'app-import-comics',
  templateUrl: './import-comic-list.component.html',
  styleUrls: ['./import-comic-list.component.css']
})
export class ImportComicListComponent implements OnInit {
  directoryForm: FormGroup;
  directory: AbstractControl;
  delete_blocked_pages: AbstractControl;
  file_details: FileDetails[];
  importing = false;
  plural = true;
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
    this.directoryForm = builder.group({
      'directory': ['', Validators.required],
      'delete_blocked_pages': [''],
    });
    this.directory = this.directoryForm.controls['directory'];
    this.delete_blocked_pages = this.directoryForm.controls['delete_blocked_pages'];
  }

  ngOnInit() {
    const that = this;
    this.alert_service.show_busy_message('');
    setInterval(() => {
      // don't try to get the pending imports if we're already doing it...
      if (that.waiting_on_imports === true) {
        return;
      }
      that.waiting_on_imports = true;
      that.comic_service.get_number_of_pending_imports().subscribe(
        count => {
          that.pending_imports = count;
        },
        error => {
          that.alert_service.show_error_message('Error getting the number of pending imports...', error);
          that.alert_service.show_busy_message('');
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
    this.alert_service.show_busy_message('Fetching List Of Comic Files...');
    const directory = this.directory.value;
    this.comic_service.get_files_under_directory(directory).subscribe(
      (files: FileDetails[]) => {
        that.file_details = files;
        that.file_details.forEach((file_detail: FileDetails) => file_detail.selected = false);
        that.plural = this.file_details.length !== 1;
        that.selected_file_count = 0;
        that.alert_service.show_info_message('Fetched ' + that.file_details.length + ' comic' + (that.plural ? 's' : '') + '...');
        that.alert_service.show_busy_message('');
      },
      error => {
        that.alert_service.show_error_message('Error while loading filenames...', error);
        that.alert_service.show_busy_message('');
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
    this.file_details.forEach((file) => {
      file.selected = true;
    });
    this.selected_file_count = this.file_details.length;
  }

  import_selected_files(): void {
    const that = this;
    this.importing = true;
    const selected_files = this.file_details.filter(file => file.selected).map(file => file.filename);
    this.alert_service.show_busy_message('Preparing to import ' + selected_files + ' comics...');
    this.comic_service.import_files_into_library(selected_files, this.delete_blocked_pages.value).subscribe(
      () => {
        this.file_details = [];
      },
      error => {
        this.alert_service.show_error_message('Failed to import comics...', error);
        that.importing = false;
        that.alert_service.show_busy_message('');
      },
      () => {
        this.alert_service.show_busy_message('');
      }
    );
  }

  plural_imports(): boolean {
    return (this.pending_imports !== 1);
  }
}
