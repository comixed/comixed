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
import { ComicImportAdaptor } from 'app/comic-import/adaptors/comic-import.adaptor';
import { Subscription } from 'rxjs';

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
  sortField: string;
  rows: number;
  sameHeight: boolean;
  coverSize: number;
  deleteBlockedPages = false;

  constructor(
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private comicImportAdaptor: ComicImportAdaptor,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadTranslations();
      }
    );
    this.loadSortFieldOptions();
    this.loadRowsOptions();
    this.loadImportOptions();
    this.layoutSubscription = this.libraryDisplayAdaptor.layout$.subscribe(
      layout => (this.gridLayout = layout === 'grid')
    );
    this.layout = this.libraryDisplayAdaptor.getLayout();
    this.sortField = this.libraryDisplayAdaptor.getSortField();
    this.rows = this.libraryDisplayAdaptor.getDisplayRows();
    this.sameHeight = this.libraryDisplayAdaptor.getSameHeight();
    this.coverSize = this.libraryDisplayAdaptor.getCoverSize();
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
  }

  findComics(): void {
    this.authenticationAdaptor.setPreference(
      'import.directory',
      this.directory
    );
    this.comicImportAdaptor.getComicFiles(this.directory);
  }

  selectAllComicFiles(): void {
    this.comicImportAdaptor.selectComicFiles(this.comicFiles);
  }

  deselectAllComicFiles(): void {
    this.comicImportAdaptor.deselectComicFiles(this.selectedComicFiles);
  }

  setSortField(sortField: string): void {
    this.sortField = sortField;
    this.libraryDisplayAdaptor.setSortField(sortField, false);
  }

  setComicsShown(rows: number): void {
    this.rows = rows;
    this.libraryDisplayAdaptor.setDisplayRows(rows);
  }

  useSameHeight(sameHeight: boolean): void {
    this.sameHeight = sameHeight;
    this.libraryDisplayAdaptor.setSameHeight(sameHeight);
  }

  setCoverSize(coverSize: number): void {
    this.coverSize = coverSize;
    this.libraryDisplayAdaptor.setCoverSize(coverSize, false);
  }

  saveCoverSize(coverSize: number): void {
    this.coverSize = coverSize;
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
      accept: () =>
        this.comicImportAdaptor.startImport(
          this.selectedComicFiles,
          !withMetadata,
          this.deleteBlockedPages
        )
    });
  }

  setGridLayout(useGridLayout: boolean): void {
    const layout = useGridLayout ? 'grid' : 'list';
    this.libraryDisplayAdaptor.setLayout(layout);
    this.dataView.changeLayout(layout);
  }
}
