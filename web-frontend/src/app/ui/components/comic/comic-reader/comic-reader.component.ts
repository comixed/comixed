/*
 * ComiXed - A digital comic book library management application.
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

import { Component, OnInit, Input } from '@angular/core';

import { Comic } from '../../../../models/comic';
import { Page } from '../../../../models/page';
import { ComicService } from '../../../../services/comic.service';

@Component({
  selector: 'app-comic-reader',
  templateUrl: './comic-reader.component.html',
  styleUrls: ['./comic-reader.component.css']
})
export class ComicReaderComponent implements OnInit {
  @Input() comic: Comic;
  @Input() current_page: number;

  protected pages: any[];

  constructor(
    private comic_service: ComicService,
  ) { }

  ngOnInit() {
    if (!this.current_page) {
      this.current_page = 0;
    }

    this.pages = [];
    this.comic.pages.forEach((page: Page) => {
      this.pages.push({ source: this.comic_service.get_url_for_page_by_id(page.id), alt: page.filename, title: page.filename });
    });
  }

  set_current_page(index: number): void {
    this.current_page = index;
  }
}
