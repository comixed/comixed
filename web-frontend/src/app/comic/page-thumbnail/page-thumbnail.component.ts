/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {Component, OnInit, Input} from '@angular/core';

import {ComicService} from '../comic.service';
import {AlertService} from '../../alert.service';
import {Page} from '../page.model';
import {PageType} from '../page-type.model';

@Component({
  selector: 'app-page-thumbnail',
  templateUrl: './page-thumbnail.component.html',
  styleUrls: ['./page-thumbnail.component.css']
})
export class PageThumbnailComponent implements OnInit {
  @Input() missing: boolean;
  @Input() page: Page;
  @Input() page_types: PageType[];
  page_url: string;
  show_details = false;
  width = 192;
  page_title: string;
  page_type_text: string;

  constructor(
    private comic_service: ComicService,
    private alert_service: AlertService,
  ) {}

  ngOnInit() {
    this.page_url = this.missing ? '/assets/img/missing.png' : this.comic_service.geturl_for_page_by_id(this.page.id);
    this.page_title = `Page #${this.page.index}`;
    this.page_type_text = this.comic_service.get_display_name_for_page_type(this.page.page_type);
  }

  get_page_type_text(page_type: PageType): string {
    return this.comic_service.get_display_name_for_page_type(page_type);
  }

  clicked(event: any): void {
    this.comic_service.set_current_page(this.page);
    event.preventDefault();
  }

  page_is_filtered(): boolean {
    return this.page.page_type.name === 'filtered';
  }
}
