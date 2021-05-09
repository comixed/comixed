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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ComicFile } from '@app/comic-file/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { setComicFilesSelectedState } from '@app/comic-file/actions/comic-file-list.actions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComicFileDetailsData } from '@app/library/models/ui/comic-file-details-data';
import { Subscription } from 'rxjs';
import {
  selectComicFiles,
  selectComicFileSelections
} from '@app/comic-file/selectors/comic-file-list.selectors';

export const CARD_WIDTH_PADDING = 20;

@Component({
  selector: 'cx-comic-file-details',
  templateUrl: './comic-file-details.component.html',
  styleUrls: ['./comic-file-details.component.scss']
})
export class ComicFileDetailsComponent implements OnInit, OnDestroy {
  file: ComicFile = null;
  pageSize: number;

  filesSubscription: Subscription;
  files: ComicFile[];
  selectedFilesSubscription: Subscription;
  selectedFiles: ComicFile[];
  selected = false;
  noPreviousFile = true;
  noNextFile = true;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    public dialogRef: MatDialogRef<ComicFileDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComicFileDetailsData
  ) {
    this.file = this.data.file;
    this.pageSize = this.data.pageSize;

    this.filesSubscription = this.store
      .select(selectComicFiles)
      .subscribe(files => {
        this.files = files;
        this.updateNavigationButtons();
      });
    this.selectedFilesSubscription = this.store
      .select(selectComicFileSelections)
      .subscribe(selectedFiles => {
        this.selectedFiles = selectedFiles;
        this.selected = this.selectedFiles.includes(this.file);
      });
  }

  get cardWidth(): string {
    return `${this.pageSize + CARD_WIDTH_PADDING}px`;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.filesSubscription.unsubscribe();
    this.selectedFilesSubscription.unsubscribe();
  }

  onSelectFile(selected: boolean): void {
    this.logger.debug(
      `${selected ? 'Selecting' : 'Deselecting'} current file:`,
      this.file
    );
    this.store.dispatch(
      setComicFilesSelectedState({ files: [this.file], selected })
    );
  }

  onPreviousFile(): void {
    const index = this.files.indexOf(this.file) - 1;
    this.file = this.files[index];
    this.selected = this.selectedFiles.includes(this.file);
    this.updateNavigationButtons();
  }

  onNextFile(): void {
    const index = this.files.indexOf(this.file) + 1;
    this.file = this.files[index];
    this.selected = this.selectedFiles.includes(this.file);
    this.updateNavigationButtons();
  }

  updateNavigationButtons(): void {
    const index = this.files.indexOf(this.file);
    this.noPreviousFile = index === 0;
    this.noNextFile = index === this.files.length - 1;
  }
}
