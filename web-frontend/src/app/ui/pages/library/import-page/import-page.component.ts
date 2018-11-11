/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { UserService } from '../../../../services/user.service';
import { FileDetails } from '../../../../models/file-details.model';
import { ComicService } from '../../../../services/comic.service';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.css']
})
export class ImportPageComponent implements OnInit {
  readonly ROWS_PARAMETER = 'rows';
  readonly SORT_PARAMETER = 'sort';
  readonly COVER_PARAMETER = 'coversize';

  protected sort_options: Array<SelectItem>;
  protected sort_by: string;

  protected rows_options: Array<SelectItem>;
  protected rows: number;

  protected cover_size: number;

  protected file_details: Array<FileDetails> = [];
  protected selected_file_detail: FileDetails;
  protected selected_file_count = 0;
  protected plural = false;
  protected waiting_on_imports = false;
  protected pending_imports = 0;
  protected any_selected = false;
  protected importing = false;
  protected show_selections_only = false;
  protected delete_blocked_pages = false;

  constructor(
    private user_service: UserService,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.selected_file_detail = null;
    activatedRoute.queryParams.subscribe(params => {
      this.sort_by = params[this.SORT_PARAMETER] || 'filename';
      this.rows = this.load_parameter(params[this.ROWS_PARAMETER], 10);
      this.cover_size = this.load_parameter(params[this.COVER_PARAMETER],
        parseInt(this.user_service.get_user_preference('cover_size', '200'), 10));
    });
    this.sort_options = [
      { label: 'Filename', value: 'filename' },
      { label: 'Size', value: 'size' },
    ];
    this.rows_options = [
      { label: '10 comics', value: 10 },
      { label: '25 comics', value: 25 },
      { label: '50 comics', value: 50 },
      { label: '100 comics', value: 100 },
    ];
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
  }

  set_sort_by(sort_by: string): void {
    this.sort_by = sort_by;
    this.update_params(this.SORT_PARAMETER, this.sort_by);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.update_params(this.ROWS_PARAMETER, `${this.rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.update_params(this.COVER_PARAMETER, `${this.cover_size}`);
    this.user_service.set_user_preference('cover_size', `${this.cover_size}`);
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }

  get_cover_url(file: FileDetails): string {
    return this.comic_service.get_cover_url_for_file(file.filename);
  }

  retrieve_files(directory: string): void {
    const that = this;
    this.alert_service.show_busy_message('Fetching List Of Comic Files...');
    this.selected_file_detail = null;
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

  set_select_all(select: boolean): void {
    this.file_details.forEach((file) => {
      file.selected = select;
    });
    this.selected_file_count = select ? this.file_details.length : 0;
    this.any_selected = this.selected_file_count > 0;
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

  set_show_selections_only(show: boolean): void {
    this.show_selections_only = show;
  }

  set_delete_blocked_pages(value: boolean): void {
    this.delete_blocked_pages = value;
  }

  disable_inputs(): boolean {
    return this.file_details.length === 0;
  }

  toggle_selected_state(file: FileDetails): void {
    file.selected = !file.selected;
    if (file.selected) {
      this.selected_file_count = this.selected_file_count + 1;
    } else {
      this.selected_file_count = this.selected_file_count - 1;
    }
    this.any_selected = this.selected_file_count > 0;

  }
}
