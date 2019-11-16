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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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
  fetchingFilesSubscription: Subscription;
  fetchingFiles = false;

  showSelections = false;

  constructor(
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private comicImportAdaptor: ComicImportAdaptor
  ) {}

  ngOnInit() {
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
    this.fetchingFilesSubscription = this.comicImportAdaptor.fetchingComicFile$.subscribe(
      fetching => (this.fetchingFiles = fetching)
    );
  }

  ngOnDestroy() {
    this.layoutSubscription.unsubscribe();
    this.sortFieldSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
    this.fetchingFilesSubscription.unsubscribe();
  }

  @Input() set comicFiles(comicFiles: ComicFile[]) {
    this._comicFiles = comicFiles;
  }

  get comicFiles(): ComicFile[] {
    return this._comicFiles;
  }

  @Input() set selectedComicFiles(selectedComicFiles: ComicFile[]) {
    this._selectedComicFiles = selectedComicFiles;
  }

  get selectedComicFiles(): ComicFile[] {
    return this._selectedComicFiles;
  }

  setSelected(comicFile: ComicFile, selected: boolean): void {
    if (!!comicFile) {
      if (selected) {
        this.comicImportAdaptor.selectComicFiles([comicFile]);
      } else {
        this.comicImportAdaptor.deselectComicFiles([comicFile]);
      }
    }
  }
}
