/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/library';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { Subscription } from 'rxjs';
import {
  COMIC_IMPORT_DIRECTORY,
  COMIC_IMPORT_MAXIMUM
} from 'app/comic-import/comic-import.constants';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { AppState } from 'app/comic-import';
import { findComicFiles } from 'app/comic-import/actions/find-comic-files.actions';
import {
  clearComicFileSelections,
  selectComicFile
} from 'app/comic-import/actions/selected-comic-files.actions';
import { importComics } from 'app/comic-import/actions/import-comics.actions';

@Component({
  selector: 'app-comic-file-list-toolbar',
  templateUrl: './comic-file-list-toolbar.component.html',
  styleUrls: ['./comic-file-list-toolbar.component.scss']
})
export class ComicFileListToolbarComponent implements OnInit, OnDestroy {
  @Input() busy: boolean;
  @Input() directory: string;
  @Input() comicFiles: ComicFile[] = [];
  @Input() selectedComicFiles: ComicFile[] = [];
  @Input() dataView: any;

  @Output() changeLayout = new EventEmitter<string>();
  @Output() showSelections = new EventEmitter<boolean>();
  @Output() filterText = new EventEmitter<string>();

  langChangeSubscription: Subscription;

  sortFieldOptions: SelectItem[];
  rowOptions: SelectItem[];
  importOptions: MenuItem[];

  layoutSubscription: Subscription;
  gridLayout = true;
  sortFieldSubscription: Subscription;
  sortField: string;
  rowsSubscription: Subscription;
  rows: number;
  sameHeightSubscription: Subscription;
  sameHeight: boolean;
  coverSizeSubscription: Subscription;
  coverSize: number;
  deleteBlockedPages = false;
  maximumOptions: SelectItem[] = [];
  maximum = 0;

  constructor(
    private logger: LoggerService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadTranslations();
      }
    );
    this.loadTranslations();
    this.authenticationAdaptor.user$.subscribe(user => {
      this.maximum = parseInt(
        this.authenticationAdaptor.getPreference(COMIC_IMPORT_MAXIMUM) || '0',
        10
      );
    });
    this.layoutSubscription = this.libraryDisplayAdaptor.layout$.subscribe(
      layout => (this.gridLayout = layout === 'grid')
    );
    this.sortFieldSubscription = this.libraryDisplayAdaptor.sortField$.subscribe(
      field => (this.sortField = field)
    );
    this.rowsSubscription = this.libraryDisplayAdaptor.rows$.subscribe(
      rows => (this.rows = rows)
    );
    this.sameHeightSubscription = this.libraryDisplayAdaptor.sameHeight$.subscribe(
      sameHeight => (this.sameHeight = sameHeight)
    );
    this.coverSizeSubscription = this.libraryDisplayAdaptor.coverSize$.subscribe(
      coverSize => (this.coverSize = coverSize)
    );
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
    this.layoutSubscription.unsubscribe();
    this.sortFieldSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
  }

  findComics(): void {
    this.logger.trace('Finding comic files');
    this.authenticationAdaptor.setPreference(
      COMIC_IMPORT_DIRECTORY,
      this.directory
    );
    this.store.dispatch(
      findComicFiles({ directory: this.directory, maximum: this.maximum })
    );
  }

  selectAllComicFiles(): void {
    this.logger.trace('Selecting all comic files');
    this.comicFiles.forEach(comicFile =>
      this.store.dispatch(selectComicFile({ file: comicFile }))
    );
  }

  deselectAllComicFiles(): void {
    this.logger.trace('Deselecting all comic files');
    this.store.dispatch(clearComicFileSelections());
  }

  setSortField(sortField: string): void {
    this.libraryDisplayAdaptor.setSortField(sortField, false);
  }

  setComicsShown(rows: number): void {
    this.libraryDisplayAdaptor.setDisplayRows(rows);
  }

  useSameHeight(sameHeight: boolean): void {
    this.libraryDisplayAdaptor.setSameHeight(sameHeight);
  }

  setCoverSize(coverSize: number): void {
    this.libraryDisplayAdaptor.setCoverSize(coverSize, false);
  }

  saveCoverSize(coverSize: number): void {
    this.libraryDisplayAdaptor.setCoverSize(coverSize);
  }

  private loadSortFieldOptions(): void {
    this.sortFieldOptions = [
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.sort-field.filename'
        ),
        value: 'filename'
      },
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.sort-field.size'
        ),
        value: 'size'
      }
    ];
  }

  private loadRowsOptions(): void {
    this.rowOptions = [
      {
        label: this.translateService.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }

  loadImportOptions(): void {
    this.importOptions = [
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.import.with-metadata'
        ),
        command: () => this.startImport(true)
      },
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.import.without-metadata'
        ),
        command: () => this.startImport(false)
      }
    ];
  }

  toggleBlockedPages() {
    this.deleteBlockedPages = !this.deleteBlockedPages;
  }

  private loadTranslations() {
    this.loadSortFieldOptions();
    this.loadRowsOptions();
    this.loadImportOptions();
    this.loadMaximumOptions();
  }

  startImport(withMetadata: boolean): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-file-list-toolbar.start-import.header',
        { count: this.selectedComicFiles.length }
      ),
      message: this.translateService.instant(
        'comic-file-list-toolbar.start-import.message',
        { count: this.selectedComicFiles.length, withMetadata: withMetadata }
      ),
      icon: 'fa fa-fw fa-question-circle',
      accept: () => {
        this.logger.trace('Starting to the comic file import process');
        this.store.dispatch(
          importComics({
            files: this.selectedComicFiles,
            ignoreMetadata: !withMetadata,
            deleteBlockedPages: this.deleteBlockedPages
          })
        );
      }
    });
  }

  setGridLayout(useGridLayout: boolean): void {
    const layout = useGridLayout ? 'grid' : 'list';
    this.libraryDisplayAdaptor.setLayout(layout);
    this.dataView.changeLayout(layout);
  }

  private loadMaximumOptions() {
    this.maximumOptions = [
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.maximum.unlimited'
        ),
        value: 0
      },
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.maximum.50-comics'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.maximum.100-comics'
        ),
        value: 100
      },
      {
        label: this.translateService.instant(
          'comic-file-list-toolbar.options.maximum.1000-comics'
        ),
        value: 1000
      }
    ];
  }

  setMaximum(value: number): void {
    this.logger.debug(`setting maximum import values: ${value}`);
    this.authenticationAdaptor.setPreference(COMIC_IMPORT_MAXIMUM, `${value}`);
  }
}
