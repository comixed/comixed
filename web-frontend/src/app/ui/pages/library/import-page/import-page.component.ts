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

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as UserActions from '../../../../actions/user.actions';
import { SelectItem } from 'primeng/api';
import { ComicFile } from '../../../../models/import/comic-file';
import { User } from '../../../../models/user/user';
import { Preference } from '../../../../models/user/preference';
import { ComicService } from '../../../../services/comic.service';
import { AlertService } from '../../../../services/alert.service';
import {
  IMPORT_SORT,
  IMPORT_ROWS,
  IMPORT_COVER_SIZE,
} from '../../../../models/user/preferences.constants';

const ROWS_PARAMETER = 'rows';
const SORT_PARAMETER = 'sort';
const COVER_PARAMETER = 'coversize';

const COVER_SIZE_PREFERENCE = 'cover_size';
const SORT_PREFERENCE = 'import_sort';
const ROWS_PREFERENCE = 'import_rows';

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.css']
})
export class ImportPageComponent implements OnInit, OnDestroy {
  protected sort_options: Array<SelectItem>;
  protected sort_by: string;

  protected rows_options: Array<SelectItem>;
  protected rows: number;

  protected cover_size: number;

  protected file_details: Array<ComicFile> = [];
  protected selected_file_detail: ComicFile;
  protected selected_files: Array<ComicFile> = [];
  protected show_selected_files = false;

  protected plural = false;
  protected waiting_on_imports = false;
  pending_imports = 0;
  protected any_selected = false;
  protected importing = false;
  protected show_selections_only = false;
  protected delete_blocked_pages = false;

  protected busy = false;

  user$: Observable<User>;
  user_subscription: Subscription;
  user: User;

  constructor(
    private comic_service: ComicService,
    private alert_service: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.user$ = store.select('user');
    this.selected_file_detail = null;
    activatedRoute.queryParams.subscribe(params => {
      this.sort_by = params[SORT_PARAMETER] || 'filename';
      this.rows = parseInt(params[ROWS_PARAMETER] || '10', 10);
      this.cover_size = parseInt(params[COVER_PARAMETER] || '200', 10);
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

  private get_parameter(name: string): string {
    const which = this.user.preferences.find((preference: Preference) => {
      return preference.name === name;
    });

    if (which) {
      return which.value;
    } else {
      return null;
    }
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe(
      (user: User) => {
        this.user = user;

        this.sort_by = this.get_parameter(IMPORT_SORT) || this.sort_by;
        this.rows = parseInt(this.get_parameter(IMPORT_ROWS) || `${this.rows}`, 10);
        this.cover_size = parseInt(this.get_parameter(IMPORT_COVER_SIZE) || `${this.cover_size}`, 10);
      });
    this.busy = true;
    setInterval(() => {
      // don't try to get the pending imports if we're already doing it...
      if (this.waiting_on_imports === true) {
        return;
      }
      this.waiting_on_imports = true;
      this.comic_service.get_number_of_pending_imports().subscribe(
        count => {
          this.pending_imports = count;
          this.busy = false;
        },
        error => {
          this.alert_service.show_error_message('Error getting the number of pending imports...', error);
          this.busy = false;
        },
        () => {
          this.waiting_on_imports = false;
        });
    }, 250);
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
  }

  set_sort_by(sort_by: string): void {
    this.sort_by = sort_by;
    this.update_params(SORT_PARAMETER, this.sort_by);
    this.store.dispatch(new UserActions.UserSetPreference({
      name: IMPORT_SORT,
      value: sort_by,
    }));
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.update_params(ROWS_PARAMETER, `${this.rows}`);
    this.store.dispatch(new UserActions.UserSetPreference({
      name: IMPORT_ROWS,
      value: `${rows}`,
    }));
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  save_cover_size(cover_size: number): void {
    this.update_params(COVER_PARAMETER, `${this.cover_size}`);
    this.store.dispatch(new UserActions.UserSetPreference({
      name: IMPORT_COVER_SIZE,
      value: `${cover_size}`,
    }));
  }

  retrieve_files(directory: string): void {
    const that = this;
    this.busy = true;
    this.selected_file_detail = null;
    this.comic_service.get_files_under_directory(directory).subscribe(
      (files: ComicFile[]) => {
        that.file_details = files;
        that.file_details.forEach((file_detail: ComicFile) => file_detail.selected = false);
        that.plural = this.file_details.length !== 1;
        that.alert_service.show_info_message('Fetched ' + that.file_details.length + ' comic' + (that.plural ? 's' : '') + '...');
        that.busy = false;
      },
      error => {
        that.alert_service.show_error_message('Error while loading filenames...', error);
        that.busy = false;
      }
    );
  }

  set_select_all(select: boolean): void {
    this.selected_files = [];
    this.file_details.forEach((file) => {
      file.selected = select;
      if (select) {
        this.selected_files.push(file);
      }
    });
    this.any_selected = this.selected_files.length > 0;
  }

  import_selected_files(): void {
    const that = this;
    this.selected_file_detail = null;
    this.importing = true;
    const selected_files = this.file_details.filter(file => file.selected).map(file => file.filename);
    that.busy = true;
    this.comic_service.import_files_into_library(selected_files, this.delete_blocked_pages).subscribe(
      () => {
        this.file_details = [];
      },
      error => {
        this.alert_service.show_error_message('Failed to import comics...', error);
        that.importing = false;
        that.busy = false;
      },
      () => {
        that.busy = false;
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
      return `Selected ${this.selected_files.length} Of ${this.file_details.length} Comics...`;
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

  toggle_selected_state(file: ComicFile): void {
    file.selected = !file.selected;
    if (file.selected) {
      this.selected_files.push(file);
    } else {
      this.selected_files = this.selected_files.filter((file_detail: ComicFile) => {
        return file_detail.filename !== file.filename;
      });
    }
    this.any_selected = this.selected_files.length > 0;
  }

  show_selections(): void {
    this.show_selected_files = true;
  }

  hide_selections(): void {
    this.show_selected_files = false;
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
}
