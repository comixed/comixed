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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ComicService } from 'app/services/comic.service';
import {
  IMPORT_COVER_SIZE,
  IMPORT_LAST_DIRECTORY,
  IMPORT_ROWS,
  IMPORT_SORT
} from 'app/user/models/preferences.constants';
import { AuthenticationAdaptor, User } from 'app/user';
import { SelectItem } from 'primeng/api';
import { ComicFile, ImportAdaptor, LibraryAdaptor } from 'app/library';

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
  user_subscription: Subscription;
  user: User;
  comic_files_subscription: Subscription;
  comic_files: ComicFile[];
  selected_comic_files_subscription: Subscription;
  selected_comic_files: ComicFile[];
  import_count_subscription: Subscription;
  import_count = 0;
  fetching_files_subscription: Subscription;
  fetching_files = false;
  importing_subscription: Subscription;
  importing = false;

  protected sort_options: SelectItem[];
  protected sort_by: string;
  protected rows_options: SelectItem[];
  protected rows: number;
  protected cover_size: number;
  protected plural = false;
  protected any_selected = false;
  protected show_selections_only = false;
  protected delete_blocked_pages = false;

  constructor(
    private library_adaptor: LibraryAdaptor,
    private auth_adaptor: AuthenticationAdaptor,
    private import_adaptor: ImportAdaptor,
    private comic_service: ComicService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    activatedRoute.queryParams.subscribe(params => {
      this.sort_by = params[SORT_PARAMETER] || 'filename';
      this.rows = parseInt(params[ROWS_PARAMETER] || '10', 10);
      this.cover_size = parseInt(params[COVER_PARAMETER] || '200', 10);
    });
    this.sort_options = [
      {
        label: 'Filename',
        value: 'filename'
      },
      {
        label: 'Size',
        value: 'size'
      }
    ];
    this.rows_options = [
      {
        label: '10 comics',
        value: 10
      },
      {
        label: '25 comics',
        value: 25
      },
      {
        label: '50 comics',
        value: 50
      },
      {
        label: '100 comics',
        value: 100
      }
    ];
  }

  ngOnInit() {
    this.user_subscription = this.auth_adaptor.user$.subscribe(user => {
      this.user = user;
    });
    this.comic_files_subscription = this.import_adaptor.comic_file$.subscribe(
      comic_files => (this.comic_files = comic_files)
    );
    this.selected_comic_files_subscription = this.import_adaptor.selected_comic_file$.subscribe(
      selected_files => (this.selected_comic_files = selected_files)
    );
    this.fetching_files_subscription = this.import_adaptor.fetching_files$.subscribe(
      fetching => (this.fetching_files = fetching)
    );
    this.importing_subscription = this.library_adaptor.pending_import$.subscribe(
      count => (this.importing = count > 0)
    );
    this.import_count_subscription = this.library_adaptor.pending_import$.subscribe(
      import_count => {
        this.import_count = import_count;
        this.importing = import_count > 0;
      }
    );

    this.import_adaptor.set_directory(
      this.auth_adaptor.get_preference(IMPORT_LAST_DIRECTORY)
    );
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
    this.comic_files_subscription.unsubscribe();
    this.fetching_files_subscription.unsubscribe();
    this.importing_subscription.unsubscribe();
    this.import_count_subscription.unsubscribe();
  }

  set_sort_by(sort_by: string): void {
    this.sort_by = sort_by;
    this.update_params(SORT_PARAMETER, this.sort_by);
    this.auth_adaptor.set_preference(IMPORT_SORT, sort_by);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.update_params(ROWS_PARAMETER, `${this.rows}`);
    this.auth_adaptor.set_preference(IMPORT_ROWS, `${rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  save_cover_size(cover_size: number): void {
    this.update_params(COVER_PARAMETER, `${this.cover_size}`);
    this.auth_adaptor.set_preference(IMPORT_COVER_SIZE, `${cover_size}`);
  }

  retrieve_files(directory: string): void {
    this.auth_adaptor.set_preference(IMPORT_LAST_DIRECTORY, directory);
    this.import_adaptor.fetch_files(directory);
  }

  set_select_all(select: boolean): void {
    if (select) {
      this.select_comics(this.comic_files);
    } else {
      this.unselect_comics(this.comic_files);
    }
  }

  import_selected_files(): void {
    this.import_adaptor.start_importing(this.delete_blocked_pages, false);
  }

  plural_imports(): boolean {
    return this.import_count !== 1;
  }

  get_import_title(): string {
    if (this.import_count === 0) {
      return 'Preparing To Import Comics...';
    }
    return (
      `There ${this.plural_imports() ? 'Are' : 'Is'} ${this.import_count} ` +
      `Comic${this.plural_imports() ? 's' : ''} Remaining To Be Imported...`
    );
  }

  get_comic_selection_title(): string {
    if (this.comic_files.length === 0) {
      return 'No Comics Are Loaded';
    } else {
      return `Selected ${this.selected_comic_files.length} Of ${this.comic_files.length} Comics...`;
    }
  }

  set_show_selections_only(show: boolean): void {
    this.show_selections_only = show;
  }

  set_delete_blocked_pages(value: boolean): void {
    this.delete_blocked_pages = value;
  }

  disable_inputs(): boolean {
    return this.comic_files.length === 0;
  }

  toggle_selected_state(file: ComicFile): void {
    const files = new Array<ComicFile>();
    files.push(file);
    if (file.selected) {
      this.unselect_comics(files);
    } else {
      this.select_comics(files);
    }
  }

  private get_parameter(name: string): string {
    return this.auth_adaptor.get_preference(name);
  }

  private select_comics(files: Array<ComicFile>): void {
    this.import_adaptor.select_comic_files(files);
  }

  private unselect_comics(files: Array<ComicFile>): void {
    this.import_adaptor.deselect_comic_files(files);
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign(
      {},
      this.activatedRoute.snapshot.queryParams
    );
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    });
  }
}
