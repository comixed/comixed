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

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { MatMenuTrigger } from '@angular/material/menu';
import { setBlockedState } from '@app/comic-pages/actions/block-page.actions';
import { Page } from '@app/comic-books/models/page';
import { Comic } from '@app/comic-books/models/comic';
import { TranslateService } from '@ngx-translate/core';
import { updatePageDeletion } from '@app/comic-books/actions/comic.actions';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as _ from 'lodash';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'cx-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.scss']
})
export class ComicPagesComponent implements AfterViewInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @ViewChild(MatSort) sort: MatSort;

  @Input() showPagesAsGrid = true;
  @Input() isAdmin = false;

  @Output() pagesChanged = new EventEmitter<Page[]>();

  readonly displayedColumns = [
    'thumbnail',
    'position',
    'filename',
    'dimensions'
  ];
  dataSource = new MatTableDataSource<Page>([]);
  page: Page;
  contextMenuX = '';
  contextMenuY = '';

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'position':
          return data.index;
        case 'filename':
          return data.filename;
        default:
          return null;
      }
    };
  }

  private _pages: Page[] = [];

  get pages(): Page[] {
    return this._pages;
  }

  set pages(pages: Page[]) {
    this._pages = pages;
    this.pagesChanged.emit(pages);
    this.dataSource.data = this.pages;
  }

  private _comic: Comic = null;

  get comic(): Comic {
    return this._comic;
  }

  @Input() set comic(comic: Comic) {
    this._comic = comic;
    this.pages = comic?.pages || [];
  }

  onShowContextMenu(page: Page, x: string, y: string): void {
    this.logger.debug('Popping up context menu for:', page);
    this.page = page;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onSetPageBlocked(page: Page, blocked: boolean): void {
    this.logger.debug('Updating page blocked state:', page, blocked);
    this.store.dispatch(setBlockedState({ hashes: [page.hash], blocked }));
  }

  onSetPageDeleted(page: Page, deleted: boolean): void {
    this.logger.trace('Confirming marking page as deleted:', deleted);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-page.update-page-deletion.confirmation-title',
        { deleted }
      ),
      message: this.translateService.instant(
        'comic-page.update-page-deletion.confirmation-message',
        { deleted }
      ),
      confirm: () => {
        this.logger.trace('Marking page as deleted:', deleted);
        this.store.dispatch(updatePageDeletion({ pages: [page], deleted }));
      }
    });
  }

  onReorderPages(dragDropEvent: CdkDragDrop<Page[], any>): void {
    this.logger.trace('Pages reordered');
    const pages = _.cloneDeep(this.pages);
    moveItemInArray(
      pages,
      dragDropEvent.previousIndex,
      dragDropEvent.currentIndex
    );
    this.logger.trace('Updating page index');
    pages.forEach((page, index) => (page.index = index));
    this.pages = pages;
  }
}
