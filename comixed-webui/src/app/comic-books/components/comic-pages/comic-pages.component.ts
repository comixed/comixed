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
  inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { MatMenuTrigger } from '@angular/material/menu';
import { ComicPage } from '@app/comic-books/models/comic-page';
import { TranslateService } from '@ngx-translate/core';
import { updatePageDeletion } from '@app/comic-books/actions/comic-book.actions';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as _ from 'lodash';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatSort } from '@angular/material/sort';
import { setBlockedStateForHash } from '@app/comic-pages/actions/blocked-hashes.actions';

@Component({
  selector: 'cx-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.scss'],
  standalone: false
})
export class ComicPagesComponent implements AfterViewInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @ViewChild(MatSort) sort: MatSort;

  @Input() showPagesAsGrid = true;
  @Input() isAdmin = false;

  @Output() pagesChanged = new EventEmitter<ComicPage[]>();

  readonly displayedColumns = [
    'page-number',
    'thumbnail',
    'filename',
    'dimensions'
  ];
  dataSource = new MatTableDataSource<ComicPage>([]);
  page: ComicPage;
  contextMenuX = '';
  contextMenuY = '';

  logger = inject(LoggerService);
  store = inject(Store);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);

  get pages(): ComicPage[] {
    return this.dataSource.data;
  }

  @Input()
  set pages(pages: ComicPage[]) {
    this.dataSource.data = _.cloneDeep(pages).sort(
      (left, right) => left.pageNumber - right.pageNumber
    );
    this.dataSource.data.forEach((entry, index) => (entry.index = index));
    this.pagesChanged.emit(this.dataSource.data);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'page-number':
          return data.pageNumber;
        case 'filename':
          return data.filename;
        default:
          return null;
      }
    };
  }

  onShowContextMenu(page: ComicPage, x: string, y: string): void {
    this.logger.debug('Popping up context menu for:', page);
    this.page = page;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onSetPageBlocked(page: ComicPage, blocked: boolean): void {
    this.logger.debug('Updating page blocked state:', page, blocked);
    this.store.dispatch(
      setBlockedStateForHash({ hashes: [page.hash], blocked })
    );
  }

  onSetPageDeleted(page: ComicPage, deleted: boolean): void {
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

  onReorderPages(dragDropEvent: CdkDragDrop<ComicPage[], any>): void {
    this.logger.trace('Pages reordered');
    const pages = _.cloneDeep(this.pages);
    moveItemInArray(
      pages,
      dragDropEvent.previousIndex,
      dragDropEvent.currentIndex
    );
    this.logger.trace('Updating page index');
    pages.forEach((page, index) => {
      page.pageNumber = index;
      page.index = index;
    });
    this.pages = pages;
  }
}
