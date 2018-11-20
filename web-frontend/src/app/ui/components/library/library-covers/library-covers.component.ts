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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Comic } from '../../../../models/comic.model';
import { Library } from '../../../../models/library';
import { LibraryDisplay } from '../../../../models/library-display';
import { ComicService } from '../../../../services/comic.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-library-covers',
  templateUrl: './library-covers.component.html',
  styleUrls: ['./library-covers.component.css']
})
export class LibraryCoversComponent implements OnInit {
  @Input() library: Library;
  @Input() library_display: LibraryDisplay;
  @Input() sort_options: Array<SelectItem>;
  @Input() rows_options: Array<SelectItem>;
  @Output() sortOrder = new EventEmitter<string>();
  @Output() rows = new EventEmitter<number>();
  @Output() coverSize = new EventEmitter<number>();
  @Output() comicSelected = new EventEmitter<Comic>();

  constructor(
    private comic_service: ComicService,
  ) { }

  ngOnInit() {
  }

  set_sort_order(sort_order: string): void {
    this.sortOrder.next(sort_order);
  }

  set_rows(rows: number): void {
    this.rows.next(rows);
  }

  set_cover_size(cover_size: number): void {
    this.coverSize.next(cover_size);
  }

  get_cover_url(comic: Comic): string {
    return this.comic_service.get_cover_url_for_comic(comic);
  }

  get_download_link(comic: Comic): string {
    return this.comic_service.get_download_link_for_comic(comic.id);
  }

  set_selected_comic(event: Event, comic: Comic): void {
    this.comicSelected.next(comic);
    event.preventDefault();
  }
}
