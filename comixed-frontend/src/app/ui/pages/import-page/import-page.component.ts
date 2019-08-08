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
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { ImportState } from 'app/models/state/import-state';
import { LibraryState } from 'app/models/state/library-state';
import * as ImportingActions from 'app/actions/importing.actions';
import { SelectItem } from 'primeng/api';
import { ComicFile } from 'app/models/import/comic-file';
import { ComicService } from 'app/services/comic.service';
import {
  IMPORT_COVER_SIZE,
  IMPORT_LAST_DIRECTORY,
  IMPORT_ROWS,
  IMPORT_SORT
} from 'app/models/preferences.constants';
import { LibraryDisplay } from 'app/models/state/library-display';
import { SelectionState } from 'app/models/state/selection-state';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { User } from 'app/models/user';
import { AuthenticationState } from 'app/models/state/authentication-state';

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
  library$: Observable<LibraryState>;
  library_subscription: Subscription;
  library: LibraryState;

  library_display$: Observable<LibraryDisplay>;
  library_display_subscription: Subscription;
  library_display: LibraryDisplay;

  import_state$: Observable<ImportState>;
  import_state_subscription: Subscription;
  import_state: ImportState;

  selection_state$: Observable<SelectionState>;
  selection_state_subscription: Subscription;
  selection_state: SelectionState;

  comic_files: ComicFile[] = [];
  selected_comic_files: ComicFile[] = [];

  auth_state_subscription: Subscription;
  user: User;

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
    private auth_adaptor: AuthenticationAdaptor,
    private comic_service: ComicService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.library$ = store.select('library');
    this.library_display$ = store.select('library_display');
    this.import_state$ = store.select('import_state');
    this.selection_state$ = store.select('selections');
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
    this.auth_state_subscription = this.auth_adaptor.auth_state$.subscribe(
      (auth_state: AuthenticationState) => {
        this.user = auth_state.user;
        this.sort_by =
          this.auth_adaptor.get_preference(IMPORT_SORT) || this.sort_by;
        this.rows =
          parseInt(this.auth_adaptor.get_preference(IMPORT_SORT), 10) ||
          this.rows;
        this.cover_size =
          parseInt(this.auth_adaptor.get_preference(IMPORT_COVER_SIZE), 1) ||
          this.cover_size;
        this.store.dispatch(
          new ImportingActions.ImportingSetDirectory({
            directory:
              this.auth_adaptor.get_preference(IMPORT_LAST_DIRECTORY) || ''
          })
        );
      }
    );

    this.library_subscription = this.library$.subscribe(
      (library: LibraryState) => {
        this.library = library;
      }
    );
    this.library_display_subscription = this.library_display$.subscribe(
      (library_display: LibraryDisplay) => {
        this.library_display = library_display;
      }
    );
    this.import_state_subscription = this.import_state$.subscribe(
      (import_state: ImportState) => {
        this.import_state = import_state;

        if (this.import_state) {
          this.comic_files = [].concat(import_state.files);

          if (!this.import_state.updating_status) {
            this.store.dispatch(
              new ImportingActions.ImportingGetPendingImports()
            );
          }
        }
      }
    );
    this.selection_state_subscription = this.selection_state$.subscribe(
      (selection_state: SelectionState) => {
        this.selection_state = selection_state;

        this.selected_comic_files = [].concat(
          this.selection_state.selected_comic_files
        );
      }
    );
  }

  ngOnDestroy() {
    this.auth_state_subscription.unsubscribe();
    this.library_subscription.unsubscribe();
    this.import_state_subscription.unsubscribe();
    this.selection_state_subscription.unsubscribe();
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
    this.store.dispatch(
      new ImportingActions.ImportingFetchFiles({ directory: directory })
    );
  }

  set_select_all(select: boolean): void {
    if (select) {
      this.select_comics(this.import_state.files);
    } else {
      this.unselect_comics(this.import_state.files);
    }
  }

  import_selected_files(): void {
    this.store.dispatch(
      new ImportingActions.ImportingImportFiles({
        files: this.import_state.files
          .filter(file => file.selected)
          .map(file => file.filename),
        ignore_metadata: false
      })
    );
  }

  plural_imports(): boolean {
    return this.library.library_contents.import_count !== 1;
  }

  get_import_title(): string {
    if (this.library.library_contents.import_count === 0) {
      return 'Preparing To Import Comics...';
    }
    return (
      `There ${this.plural_imports() ? 'Are' : 'Is'} ${
        this.library.library_contents.import_count
      } ` +
      `Comic${this.plural_imports() ? 's' : ''} Remaining To Be Imported...`
    );
  }

  get_comic_selection_title(): string {
    if (this.import_state.files.length === 0) {
      return 'No Comics Are Loaded';
    } else {
      return `Selected ${this.import_state.selected_count} Of ${this.import_state.files.length} Comics...`;
    }
  }

  set_show_selections_only(show: boolean): void {
    this.show_selections_only = show;
  }

  set_delete_blocked_pages(value: boolean): void {
    this.delete_blocked_pages = value;
  }

  disable_inputs(): boolean {
    return this.import_state.files.length === 0;
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
    this.store.dispatch(
      new ImportingActions.ImportingSelectFiles({ files: files })
    );
  }

  private unselect_comics(files: Array<ComicFile>): void {
    this.store.dispatch(
      new ImportingActions.ImportingUnselectFiles({ files: files })
    );
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
