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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IMPORT_COVER_SIZE,
  IMPORT_ROWS,
  IMPORT_SORT
} from 'app/user/models/preferences.constants';
import { AuthenticationAdaptor, User } from 'app/user';
import { SelectItem } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { LibraryAdaptor } from 'app/library';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { Store } from '@ngrx/store';
import { AppState } from 'app/comic-import';
import {
  selectFindComicFiles,
  selectFindComicFilesState
} from 'app/comic-import/selectors/find-comic-files.selectors';
import { LoggerService } from '@angular-ru/logger';
import {
  clearComicFileSelections,
  selectComicFile
} from 'app/comic-import/actions/selected-comic-files.actions';
import { selectSelectedComicFiles } from 'app/comic-import/selectors/selected-comic-files.selectors';
import { importComics } from 'app/comic-import/actions/import-comics.actions';

const ROWS_PARAMETER = 'rows';
const SORT_PARAMETER = 'sort';
const COVER_PARAMETER = 'coversize';

const COVER_SIZE_PREFERENCE = 'cover_size';
const SORT_PREFERENCE = 'import_sort';
const ROWS_PREFERENCE = 'import_rows';

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.scss']
})
export class ImportPageComponent implements OnInit, OnDestroy {
  userSubscription: Subscription;
  user: User;
  comicFilesSubscription: Subscription;
  comicFiles: ComicFile[] = [];
  selectedComicFilesSubscription: Subscription;
  selectedComicFiles: ComicFile[] = [];
  importCountSubscription: Subscription;
  importCount = 0;
  fetchingFilesSubscription: Subscription;
  fetchingFiles = false;
  importingSubscription: Subscription;
  importing = false;
  langChangeSubscription: Subscription;

  protected sort_options: SelectItem[];
  protected sort_by: string;
  protected rows_options: SelectItem[];
  protected rows: number;
  protected cover_size: number;
  protected plural = false;
  protected any_selected = false;
  protected show_selections_only = false;
  protected deleteBlockedPages = false;

  constructor(
    private logger: LoggerService,
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private authenticationAdaptor: AuthenticationAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
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
    this.comicFilesSubscription = this.store
      .select(selectFindComicFiles)
      .subscribe(comicFiles => {
        this.logger.info('Received comic files:', comicFiles);
        this.comicFiles = comicFiles;
        this.titleService.setTitle(
          this.translateService.instant('import-page.title', {
            count: this.comicFiles.length
          })
        );
      });
    this.selectedComicFilesSubscription = this.store
      .select(selectSelectedComicFiles)
      .subscribe(selectedFiles => (this.selectedComicFiles = selectedFiles));
    this.fetchingFilesSubscription = this.store
      .select(selectFindComicFilesState)
      .subscribe(state => (this.fetchingFiles = state.finding));
    this.importingSubscription = this.libraryAdaptor.processingCount$.subscribe(
      count => (this.importing = count > 0)
    );
    this.importCountSubscription = this.libraryAdaptor.processingCount$.subscribe(
      importCount => {
        this.importCount = importCount;
        this.importing = importCount > 0;
      }
    );
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnInit() {
    this.userSubscription = this.authenticationAdaptor.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.comicFilesSubscription.unsubscribe();
    this.fetchingFilesSubscription.unsubscribe();
    this.importingSubscription.unsubscribe();
    this.importCountSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  set_sort_by(sort_by: string): void {
    this.sort_by = sort_by;
    this.update_params(SORT_PARAMETER, this.sort_by);
    this.authenticationAdaptor.setPreference(IMPORT_SORT, sort_by);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.update_params(ROWS_PARAMETER, `${this.rows}`);
    this.authenticationAdaptor.setPreference(IMPORT_ROWS, `${rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  save_cover_size(cover_size: number): void {
    this.update_params(COVER_PARAMETER, `${this.cover_size}`);
    this.authenticationAdaptor.setPreference(
      IMPORT_COVER_SIZE,
      `${cover_size}`
    );
  }

  toggleSelectAll(select: boolean): void {
    if (select) {
      this.selectComicFiles(this.comicFiles);
    } else {
      this.deselectComicFiles(this.comicFiles);
    }
  }

  importSelectedFiles(): void {
    this.logger.trace('Starting comic import process');
    this.store.dispatch(
      importComics({
        files: this.selectedComicFiles,
        ignoreMetadata: false,
        deleteBlockedPages: this.deleteBlockedPages
      })
    );
  }

  plural_imports(): boolean {
    return this.importCount !== 1;
  }

  get_import_title(): string {
    if (this.importCount === 0) {
      return 'Preparing To Import Comics...';
    }
    return (
      `There ${this.plural_imports() ? 'Are' : 'Is'} ${this.importCount} ` +
      `Comic${this.plural_imports() ? 's' : ''} Remaining To Be Imported...`
    );
  }

  get_comic_selection_title(): string {
    if (this.comicFiles.length === 0) {
      return 'No Comics Are Loaded';
    } else {
      return `Selected ${this.selectedComicFiles.length} Of ${this.comicFiles.length} Comics...`;
    }
  }

  set_show_selections_only(show: boolean): void {
    this.show_selections_only = show;
  }

  set_delete_blocked_pages(value: boolean): void {
    this.deleteBlockedPages = value;
  }

  disable_inputs(): boolean {
    return this.comicFiles.length === 0;
  }

  toggle_selected_state(file: ComicFile): void {
    const files = new Array<ComicFile>();
    files.push(file);
    if (this.selectedComicFiles.includes(file)) {
      this.deselectComicFiles(files);
    } else {
      this.selectComicFiles(files);
    }
  }

  private get_parameter(name: string): string {
    return this.authenticationAdaptor.getPreference(name);
  }

  private selectComicFiles(files: ComicFile[]): void {
    this.logger.trace('Selecting all comic files');
    files.forEach(file => this.store.dispatch(selectComicFile({ file })));
  }

  private deselectComicFiles(files: ComicFile[]): void {
    this.logger.trace('Deselecting all comic files');
    this.store.dispatch(clearComicFileSelections());
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

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.admin.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.import-page'
        )
      }
    ]);
  }
}
