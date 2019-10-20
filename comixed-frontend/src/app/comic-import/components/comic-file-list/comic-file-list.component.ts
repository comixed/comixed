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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LibraryDisplayAdaptor } from 'app/library';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { ComicImportAdaptor } from 'app/comic-import/adaptors/comic-import.adaptor';

@Component({
  selector: 'app-comic-file-list',
  templateUrl: './comic-file-list.component.html',
  styleUrls: ['./comic-file-list.component.scss']
})
export class ComicFileListComponent implements OnInit, OnDestroy {
  @Input() busy: boolean;
  @Input() directory: string;

  _comicFiles: Array<ComicFile> = [];
  _selectedComicFiles: Array<ComicFile> = [];

  layoutSubscription: Subscription;
  layout: string;
  sortFieldSubscription: Subscription;
  sortField: string;
  rowsSubscription: Subscription;
  rows: number;
  sameHeightSubscription: Subscription;
  sameHeight: boolean;
  coverSizeSubscription: Subscription;
  coverSize: number;

  langChangeSubscription: Subscription;
  contextMenu: MenuItem[];
  showSelections = false;

  constructor(
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private comicImportAdaptor: ComicImportAdaptor,
    private store: Store<AppState>,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => {
        this.loadContextMenu();
      }
    );
    this.layoutSubscription = this.libraryDisplayAdaptor.layout$.subscribe(
      layout => (this.layout = layout)
    );
    this.sortFieldSubscription = this.libraryDisplayAdaptor.sortField$.subscribe(
      sortField => (this.sortField = sortField)
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

  @Input() set comicFiles(comicFiles: ComicFile[]) {
    this._comicFiles = comicFiles;
    this.loadContextMenu();
  }

  get comicFiles(): ComicFile[] {
    return this._comicFiles;
  }

  @Input() set selectedComicFiles(selectedComicFiles: ComicFile[]) {
    this._selectedComicFiles = selectedComicFiles;
    this.loadContextMenu();
  }

  get selectedComicFiles(): ComicFile[] {
    return this._selectedComicFiles;
  }

  loadContextMenu(): void {
    this.contextMenu = [
      {
        label: this.translateService.instant(
          'comic-file-list.popup.select-all',
          {
            comic_count: this.comicFiles.length
          }
        ),
        command: () =>
          this.comicImportAdaptor.selectComicFiles(this.comicFiles),
        disabled:
          !this.comicFiles.length ||
          (this.selectedComicFiles &&
            this.comicFiles.length === this.selectedComicFiles.length)
      },
      {
        label: this.translateService.instant(
          'comic-file-list.popup.deselect-all',
          {
            comic_count: this.selectedComicFiles.length
          }
        ),
        command: () =>
          this.comicImportAdaptor.deselectComicFiles(this.selectedComicFiles),
        visible: this.selectedComicFiles && this.selectedComicFiles.length > 0
      },
      {
        label: this.translateService.instant(
          'comic-file-list.popup.import.label',
          {
            comic_count: this.selectedComicFiles.length
          }
        ),
        items: [
          {
            label: this.translateService.instant(
              'comic-file-list.popup.import.with-metadata'
            ),
            command: () =>
              this.startImporting('comic-file-list.import.message', false),
            visible:
              this.selectedComicFiles && this.selectedComicFiles.length > 0
          },
          {
            label: this.translateService.instant(
              'comic-file-list.popup.import.without-metadata'
            ),
            command: () =>
              this.startImporting(
                'comic-file-list.import.message-ignore-metadata',
                true
              ),
            visible:
              this.selectedComicFiles && this.selectedComicFiles.length > 0
          }
        ]
      }
    ];
  }

  startImporting(messageKey: string, ignoreMetadata: boolean): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('comic-file-list.import.header'),
      message: this.translateService.instant(messageKey, {
        comic_count: this.selectedComicFiles.length
      }),
      accept: () => {
        const filenames = [];
        this.selectedComicFiles.forEach((comic_file: ComicFile) =>
          filenames.push(comic_file.filename)
        );
        this.comicImportAdaptor.startImport(
          this.selectedComicFiles,
          ignoreMetadata,
          false
        );
      }
    });
  }

  changeLayout(layout: string): void {
    this.libraryDisplayAdaptor.setLayout(layout);
  }

  toggleComicFileSelection(comicFile: ComicFile): void {
    if (this.selectedComicFiles.includes(comicFile)) {
      this.comicImportAdaptor.deselectComicFiles([comicFile]);
    } else {
      this.comicImportAdaptor.selectComicFiles([comicFile]);
    }
  }
}
