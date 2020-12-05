/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ComicFile } from '@app/library/models/comic-file';
import { MatTableDataSource } from '@angular/material/table';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { setComicFilesSelectedState } from '@app/library/actions/comic-import.actions';
import { Sort } from '@angular/material/sort';
import { compare } from '@app/core';

@Component({
  selector: 'cx-comic-file-list',
  templateUrl: './comic-file-list.component.html',
  styleUrls: ['./comic-file-list.component.scss'],
})
export class ComicFileListComponent implements OnInit {
  @Output() currentFile = new EventEmitter<ComicFile>();

  private _files: ComicFile[] = [];
  private _selectedFiles: ComicFile[] = [];

  dataSource = new MatTableDataSource();
  displayedColumns = ['selected', 'filename', 'size'];
  allSelected = false;

  constructor(private logger: LoggerService, private store: Store<any>) {}

  ngOnInit(): void {}

  @Input() set files(files: ComicFile[]) {
    this.logger.debug('Setting files');
    this._files = files;
    this.dataSource.data = files;
    this.currentFile.emit(null);
  }

  get files(): ComicFile[] {
    return this._files;
  }

  @Input() set selectedFiles(selectedFiles: ComicFile[]) {
    this.logger.debug('Setting selected files');
    this._selectedFiles = selectedFiles;
    this.allSelected =
      this.files.length > 0 && this.files.length === this.selectedFiles.length;
    this.logger.debug(`allSelected is now ${this.allSelected}`);
  }

  get selectedFiles(): ComicFile[] {
    return this._selectedFiles;
  }

  isFileSelected(file: ComicFile): boolean {
    return this.selectedFiles.includes(file);
  }

  onSelectAll(selected: boolean): void {
    this.logger.debug(`${selected ? 'Selecting' : 'Deselecting'} all files`);
    this.store.dispatch(
      setComicFilesSelectedState({ files: this.files, selected })
    );
  }

  onSelectFile(file: ComicFile, selected: boolean): void {
    this.logger.debug('Selecting file:', file);
    this.store.dispatch(
      setComicFilesSelectedState({ files: [file], selected })
    );
  }

  onRowSelected(file: ComicFile): void {
    this.currentFile.emit(file);
  }

  onSortChanged(sort: Sort): void {
    this.logger.debug('Sorting changed:', sort);
    const data = this.files.slice();
    if (!sort.active || sort.direction === '') {
      this.files = data;
      return;
    }
    this.files = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'selected':
          return compare(
            this.isFileSelected(a) ? 1 : 0,
            this.isFileSelected(b) ? 1 : 0,
            isAsc
          );
        case 'filename':
          return compare(a.filename, b.filename, isAsc);
        case 'size':
          return compare(a.size, b.size, isAsc);
      }
    });
  }
}
