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

import { Component, Input, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { Subscription } from 'rxjs';
import { Comic, Page, PageType } from 'app/comics';
import { LoggerService } from '@angular-ru/logger';

@Component({
  selector: 'app-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.scss']
})
export class ComicPagesComponent implements OnInit {
  @Input() isAdmin: boolean;
  @Input() comic: Comic;
  @Input() imageSize: number;
  pageTypesSubscription: Subscription;
  pageTypes: PageType[];
  protected pageTypeOptions: SelectItem[] = [];

  constructor(
    private logger: LoggerService,
    private comicAdaptor: ComicAdaptor
  ) {}

  ngOnInit() {
    this.pageTypesSubscription = this.comicAdaptor.pageTypes$.subscribe(
      pageTypes => {
        this.pageTypeOptions = pageTypes.map(pageType => {
          return { label: pageType.name, value: pageType };
        });
      }
    );
  }

  setPageType(page: Page, pageType: PageType): void {
    this.logger.debug('setting page type:', page, pageType);
    page.page_type = pageType;
    this.comicAdaptor.savePage(page);
  }

  blockPage(page: Page): void {
    this.logger.debug('marking page as blocked:', page);
    this.comicAdaptor.blockPageHash(page);
  }

  unblockPage(page: Page): void {
    this.logger.debug('unmarking page as blocked:', page);
    this.comicAdaptor.unblockPageHash(page);
  }
}
