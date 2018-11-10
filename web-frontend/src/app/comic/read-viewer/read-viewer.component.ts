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

import {Component, OnInit, Input} from '@angular/core';

import {Comic} from '../../models/comic.model';
import {ComicService} from '../../services/comic.service';

@Component({
  selector: 'app-read-viewer',
  templateUrl: './read-viewer.component.html',
  styleUrls: ['./read-viewer.component.css']
})
export class ReadViewerComponent implements OnInit {
  @Input() comic: Comic;
  @Input() current_page: number;

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    if (!this.current_page) {
      this.current_page = 0;
    }
  }

  getImageURL(page_id: number): string {
    return this.comicService.get_url_for_page_by_id(page_id);
  }

  getCurrentPageURL(): string {
    return this.comicService.get_url_for_page_by_comic_index(this.comic.id, this.current_page);
  }

  hasPreviousPage(): boolean {
    return (this.current_page > 0);
  }

  goToPreviousPage() {
    if (this.hasPreviousPage()) {
      this.current_page = this.current_page - 1;
    }
  }

  hasNextPage(): boolean {
    return (this.current_page < this.comic.page_count - 1);
  }

  goToNextPage() {
    if (this.hasNextPage()) {
      this.current_page = this.current_page + 1;
    }
  }
}
