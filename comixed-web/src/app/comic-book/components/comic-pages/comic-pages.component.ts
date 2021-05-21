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
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { MatMenuTrigger } from '@angular/material/menu';
import { setBlockedState } from '@app/blocked-pages/actions/block-page.actions';
import { Page } from '@app/comic-book/models/page';
import { Comic } from '@app/comic-book/models/comic';

@Component({
  selector: 'cx-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.scss']
})
export class ComicPagesComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  @Input() comic: Comic;
  @Input() pageSize = -1;

  page: Page;
  contextMenuX = '';
  contextMenuY = '';

  constructor(private logger: LoggerService, private store: Store<any>) {}

  ngOnInit(): void {}

  onShowContextMenu(page: Page, x: string, y: string): void {
    this.logger.debug('Popping up context menu for:', page);
    this.page = page;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onSetPageBlocked(page: Page, blocked: boolean): void {
    this.logger.debug('Updating page blocked state:', page, blocked);
    this.store.dispatch(setBlockedState({ page, blocked }));
  }
}
