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

@Component({
  selector: 'app-comic-pages',
  templateUrl: './comic-pages.component.html',
  styleUrls: ['./comic-pages.component.scss']
})
export class ComicPagesComponent implements OnInit {
  @Input() is_admin: boolean;
  @Input() comic: Comic;
  @Input() image_size: number;
  pageTypesSubscription: Subscription;
  pageTypes: PageType[];
  protected page_type_options: Array<SelectItem> = [];

  constructor(private comicAdaptor: ComicAdaptor) {}

  ngOnInit() {
    this.pageTypesSubscription = this.comicAdaptor.pageTypes$.subscribe(
      pageTypes => {
        this.page_type_options = pageTypes.map(pageType => {
          return { label: pageType.name, value: pageType };
        });
      }
    );
    // TODO fix the preference here
    //    this.image_size = parseInt(this.user_service.get_user_preference('coverSize', '200'), 10);
  }

  setPageType(page: Page, pageType: PageType): void {
    page.page_type = pageType;
    this.comicAdaptor.savePage(page);
  }

  blockPage(page: Page): void {
    this.comicAdaptor.blockPageHash(page);
  }

  unblockPage(page: Page): void {
    this.comicAdaptor.unblockPageHash(page);
  }
}
