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

import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-library-sidebar',
  templateUrl: './library-sidebar.component.html',
  styleUrls: ['./library-sidebar.component.css']
})
export class LibrarySidebarComponent implements OnInit {
  @Input() page_size: number;
  @Input() initial_sort: number;
  @Input() search_text: string;
  @Input() cover_size: number;
  @Input() initial_grouping: number;
  @Output() comicsPerPage: EventEmitter<number> = new EventEmitter<number>();
  @Output() sortBy: EventEmitter<number> = new EventEmitter<number>();
  @Output() searchFor: EventEmitter<string> = new EventEmitter<string>();
  @Output() changeCoverSize: EventEmitter<number> = new EventEmitter<number>();
  @Output() groupBy: EventEmitter<number> = new EventEmitter<number>();

  protected sorting_options: Array<SelectItem>;
  protected grouping_options: Array<SelectItem>;

  constructor(
  ) {
    this.sorting_options = [
      { label: 'Series', value: 0 },
      { label: 'Added date', value: 1 },
      { label: 'Cover date', value: 2 },
      { label: 'Last read date', value: 3 },
    ];
    this.grouping_options = [];
  }

  ngOnInit() {
  }

  set_page_size(size: any): void {
    this.comicsPerPage.next(parseInt(size.target.value, 10));
  }

  set_sorting_option(event: any): void {
    this.sortBy.next(event.value);
  }

  set_search_text(): void {
    this.searchFor.next(this.search_text);
  }

  set_cover_size(event: any): void {
    this.changeCoverSize.next(event.value);
  }

  set_grouping_option(event: any): void {
    this.groupBy.next(parseInt(event.target.value, 10));
  }
}
