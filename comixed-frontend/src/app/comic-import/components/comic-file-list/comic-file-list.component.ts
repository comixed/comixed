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

import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { LibraryDisplayAdaptor } from 'app/library';
import { generateContextMenuItems } from 'app/user-experience';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import { LoggerService } from '@angular-ru/logger';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'app/comic-import';
import { selectFindComicFilesState } from 'app/comic-import/selectors/find-comic-files.selectors';
import {
  clearComicFileSelections,
  deselectComicFile,
  selectComicFile
} from 'app/comic-import/actions/selected-comic-files.actions';

export const COMIC_FILE_CONTEXT_MENU_SELECT_ALL = 'comic-file-list-select-all';
export const COMIC_FILE_CONTEXT_MENU_DESELECT_ALL =
  'comic-file-list-deselect-all';
export const COMIC_FILE_CONTEXT_MENU_START_IMPORT =
  'comic-file-list-start-import';

@Component({
  selector: 'app-comic-file-list',
  templateUrl: './comic-file-list.component.html',
  styleUrls: ['./comic-file-list.component.scss']
})
export class ComicFileListComponent implements OnInit, OnDestroy {
  @Input() busy: boolean;
  @Input() directory: string;

  @ViewChild('contextMenu', { static: false }) contextMenu: ContextMenu;

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
  contextMenuSubscription: Subscription;
  contextMenuItems: MenuItem[] = [];
  mouseEventSubscription: Subscription;

  showSelections = false;

  constructor(
    private logger: LoggerService,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor,
    private contextMenuAdaptor: ContextMenuAdaptor,
    private translateService: TranslateService,
    private store: Store<AppState>
  ) {
    this.addContextMenuItems();
    this.fetchingFilesSubscription = this.store
      .select(selectFindComicFilesState)
      .subscribe(state => (this.fetchingFiles = state.finding));
  }

  ngOnInit() {
    this.contextMenuSubscription = this.contextMenuAdaptor.items$.subscribe(
      items =>
        (this.contextMenuItems = generateContextMenuItems(
          items,
          this.translateService
        ))
    );
    this.mouseEventSubscription = this.contextMenuAdaptor.mouseEvent$.subscribe(
      event => {
        if (!!event) {
          this.contextMenu.show(event);
        }
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
    this.removeContextMenuItems();
    this.contextMenuSubscription.unsubscribe();
    this.mouseEventSubscription.unsubscribe();
    this.layoutSubscription.unsubscribe();
    this.sortFieldSubscription.unsubscribe();
    this.rowsSubscription.unsubscribe();
    this.sameHeightSubscription.unsubscribe();
    this.coverSizeSubscription.unsubscribe();
    this.fetchingFilesSubscription.unsubscribe();
  }

  @Input() set comicFiles(comicFiles: ComicFile[]) {
    this._comicFiles = comicFiles;
    this.toggleMenuItems();
  }

  get comicFiles(): ComicFile[] {
    return this._comicFiles;
  }

  @Input() set selectedComicFiles(selectedComicFiles: ComicFile[]) {
    this._selectedComicFiles = selectedComicFiles;
    this.toggleMenuItems();
  }

  get selectedComicFiles(): ComicFile[] {
    return this._selectedComicFiles;
  }

  setSelected(comicFile: ComicFile, selected: boolean): void {
    if (!!comicFile) {
      if (selected) {
        this.logger.trace('Selecting comic file');
        this.store.dispatch(selectComicFile({ file: comicFile }));
      } else {
        this.logger.trace('Deselecting comic file');
        this.store.dispatch(deselectComicFile({ file: comicFile }));
      }
    }
  }

  hideContextMenu(): void {
    this.contextMenuAdaptor.hideMenu();
  }

  private addContextMenuItems(): void {
    this.contextMenuAdaptor.addItem(
      COMIC_FILE_CONTEXT_MENU_SELECT_ALL,
      'fa fa-fw fa-plus',
      'comic-file-list.context-menu.select-all',
      false,
      true,
      () => this.selectAll()
    );
    this.contextMenuAdaptor.addItem(
      COMIC_FILE_CONTEXT_MENU_DESELECT_ALL,
      'fa fa-fw fa-minus',
      'comic-file-list.context-menu.deselect-all',
      false,
      true,
      () => this.deselectAll()
    );
  }

  private removeContextMenuItems(): void {
    this.contextMenuAdaptor.removeItem(COMIC_FILE_CONTEXT_MENU_SELECT_ALL);
    this.contextMenuAdaptor.removeItem(COMIC_FILE_CONTEXT_MENU_DESELECT_ALL);
  }

  private selectAll(): void {
    this.logger.trace('Selecting all comic files');
    this.comicFiles.forEach(file =>
      this.store.dispatch(selectComicFile({ file }))
    );
  }

  private deselectAll(): void {
    this.logger.trace('Deselecting all comic files');
    this.store.dispatch(clearComicFileSelections());
  }

  private toggleMenuItems(): void {
    const hasSelections = this.selectedComicFiles.length > 0;
    const allSelected =
      this.selectedComicFiles.length === this.comicFiles.length;

    if (allSelected) {
      this.contextMenuAdaptor.disableItem(COMIC_FILE_CONTEXT_MENU_SELECT_ALL);
    } else {
      this.contextMenuAdaptor.enableItem(COMIC_FILE_CONTEXT_MENU_SELECT_ALL);
    }
    if (hasSelections) {
      this.contextMenuAdaptor.enableItem(COMIC_FILE_CONTEXT_MENU_DESELECT_ALL);
    } else {
      this.contextMenuAdaptor.disableItem(COMIC_FILE_CONTEXT_MENU_DESELECT_ALL);
    }
  }
}
