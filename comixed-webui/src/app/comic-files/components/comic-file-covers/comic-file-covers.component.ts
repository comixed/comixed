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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  clearComicFileSelections,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';

@Component({
  selector: 'cx-comic-file-covers',
  templateUrl: './comic-file-covers.component.html',
  styleUrls: ['./comic-file-covers.component.scss']
})
export class ComicFileCoversComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  @Input() files: ComicFile[] = [];

  contextMenuX = '';
  contextMenuY = '';
  file: ComicFile = null;
  fileSelected = false;
  hasSelections = false;

  constructor(private logger: LoggerService, private store: Store<any>) {}

  private _selectedFiles = [];

  get selectedFiles(): ComicFile[] {
    return this._selectedFiles;
  }

  @Input() set selectedFiles(selectedFiles: ComicFile[]) {
    this._selectedFiles = selectedFiles;
    this.hasSelections = selectedFiles.length > 0;
  }

  ngOnInit(): void {}

  isFileSelected(file: ComicFile): boolean {
    return this.selectedFiles.includes(file);
  }

  onShowContextMenu(file: ComicFile, x: string, y: string): void {
    this.logger.trace('Popping up context menu for:', file);
    this.file = file;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onSetOneSelected(selected: boolean): void {
    this.logger.trace('Setting file selected:', selected);
    this.store.dispatch(
      setComicFilesSelectedState({ files: [this.file], selected })
    );
  }

  onDeselectAll(): void {
    this.logger.trace('Deselecting all comic files');
    this.store.dispatch(clearComicFileSelections());
  }
}
