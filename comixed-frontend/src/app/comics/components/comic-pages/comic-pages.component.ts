/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { SelectItem } from 'primeng/api';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { Subscription } from 'rxjs';
import { Comic, Page, PageType } from 'app/comics';
import { LoggerService } from '@angular-ru/logger';
import { LibraryDisplayAdaptor } from 'app/library';

@Component({
  selector: 'app-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.scss']
})
export class ComicPagesComponent implements OnInit, OnDestroy {
  @Input() isAdmin: boolean;
  @Input() comic: Comic;
  @Input() imageSize: number;

  rowsSubscription: Subscription;
  rows = 10;

  pageTypesSubscription: Subscription;
  pageTypeOptions: SelectItem[] = [];
  selectedPage: Page = null;

  constructor(
    private logger: LoggerService,
    private comicAdaptor: ComicAdaptor,
    private libraryDisplayAdaptor: LibraryDisplayAdaptor
  ) {
    this.rowsSubscription = this.libraryDisplayAdaptor.rows$.subscribe(rows => {
      this.logger.debug(`rows is now ${rows}`);
      this.rows = rows;
    });
    this.pageTypesSubscription = this.comicAdaptor.pageTypes$.subscribe(
      pageTypes =>
        (this.pageTypeOptions = pageTypes.map(pageType => {
          return { label: pageType.name, value: pageType };
        }))
    );
    this.comicAdaptor.getPageTypes();
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.rowsSubscription.unsubscribe();
    this.pageTypesSubscription.unsubscribe();
  }

  setPageType(page: Page, pageType: PageType): void {
    this.logger.debug('setting page type:', page, pageType);
    this.comicAdaptor.setPageType(page, pageType);
  }

  blockPage(page: Page): void {
    this.logger.debug('marking page as blocked:', page);
    this.comicAdaptor.blockPageHash(page);
  }

  unblockPage(page: Page): void {
    this.logger.debug('unmarking page as blocked:', page);
    this.comicAdaptor.unblockPageHash(page);
  }

  setSelectedPage(page: Page): void {
    this.logger.debug('setting selected page:', page);
    this.selectedPage = page;
  }

  clearSelectedPage(): void {
    this.logger.debug('clearing selected page');
    this.selectedPage = null;
  }

  undeletePage(page: Page) {
    this.logger.debug('undeleting page:', page);
    this.comicAdaptor.undeletePage(page);
  }

  deletePage(page: Page) {
    this.logger.debug('deleting page:', page);
    this.comicAdaptor.deletePage(page);
  }
}
