/*
 * ComiXed - A digital comic book library management application.
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

import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserService } from '../../services/user.service';
import { FileDetails } from '../file-details.model';
import { ComicService } from '../comic.service';
import { AlertService } from '../../alert.service';
import { ImportComicListEntryComponent } from '../import-comic-list-entry/import-comic-list-entry.component';
import { IssueDetailsComponent } from '../issue/details/issue-details/issue-details.component';
import { SelectedForImportPipe } from './selected-for-import.pipe';

@Component({
  selector: 'app-import-comics',
  templateUrl: './import-comic-list.component.html',
  styleUrls: ['./import-comic-list.component.css']
})
export class ImportComicListComponent implements OnInit {
  directory_form: FormGroup;
  directory = '';
  delete_blocked_pages = false;
  file_details = [];
  importing = false;
  plural = true;
  display = 'none';
  pending_imports = 0;
  waiting_on_imports = false;
  cover_size: number;
  protected use_page_size: number;
  current_page = 1;
  selected_file_count = 0;
  show_selections_only = false;
  selected_file_detail: FileDetails;
  selected_file_detail_title: string;
  selected_file_detail_subtitle: string;
  selected_file_image_url = '';

  constructor(
    private user_service: UserService,
    private comic_service: ComicService,
    private alert_service: AlertService,
    builder: FormBuilder,
    private activeRoute: ActivatedRoute,
  ) {
    this.directory_form = builder.group({
      'directory': ['', Validators.required],
    });
    this.selected_file_detail = null;
    this.selected_file_detail_title = '';
    this.selected_file_detail_subtitle = '';
    this.selected_file_image_url = '';
    activeRoute.queryParams.subscribe(params => {
      this.reload_page_size(params['page_size']);
    });
  }

  private reload_page_size(page_size: string): void {
    if (page_size) {
      this.use_page_size = parseInt(page_size, 10);
    } else {
      this.use_page_size = parseInt(this.user_service.get_user_preference('import_page_size', '10'), 10);
    }
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
    this.cover_size = parseInt(this.user_service.get_user_preference('cover_size', '200'), 10);
  }

  on_load(): void {
    const that = this;
    this.alert_service.show_busy_message('Fetching List Of Comic Files...');
    this.selected_file_detail = null;
    const directory = this.directory;
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

  deselect_all_files(): void {
    this.file_details.forEach((file) => {
      file.selected = false;
    });
    this.selected_file_count = 0;
  }

  import_selected_files(): void {
    const that = this;
    this.selected_file_detail = null;
    this.importing = true;
    const selected_files = this.file_details.filter(file => file.selected).map(file => file.filename);
    this.alert_service.show_busy_message('Preparing to import ' + selected_files + ' comics...');
    this.comic_service.import_files_into_library(selected_files, this.delete_blocked_pages).subscribe(
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

  get_import_title(): string {
    return `There ${this.plural_imports() ? 'Are' : 'Is'} ${this.pending_imports} Comic${this.plural_imports() ? 's' : ''} Remaining...`;
  }

  get_comic_selection_title(): string {
    if (this.file_details.length === 0) {
      return 'No Comics Are Loaded';
    } else {
      return `Selected ${this.selected_file_count} Of ${this.file_details.length} Comics...`;
    }
  }

  show_details(file_detail: FileDetails): void {
    if (this.selected_file_detail !== null && this.selected_file_detail.filename === file_detail.filename) {
      this.selected_file_detail = null;
      this.selected_file_image_url = '';
    } else {
      this.selected_file_detail = file_detail;
      this.selected_file_image_url = this.comic_service.get_cover_url_for_file(this.selected_file_detail.filename);
      this.selected_file_detail_title = this.selected_file_detail.base_filename;
      this.selected_file_detail_subtitle = `${(this.selected_file_detail.size / 1024 ** 2).toPrecision(2)} Mb`;
    }

    console.log('this.selected_file_detail:', this.selected_file_detail);
  }

  set_page_size(page_size: any): void {
    this.use_page_size = parseInt(page_size.target.value, 10);
    this.user_service.set_user_preference('import_page_size', `${this.use_page_size}`);
  }

  toggle_blocked_page_deletion(): void {
    this.delete_blocked_pages = !this.delete_blocked_pages;
    this.alert_service.show_info_message(`Blocked pages will ${this.delete_blocked_pages ? '' : 'not '} be deleted...`);
  }

  toggle_show_selected(): void {
    this.show_selections_only = !this.show_selections_only;
  }
}
