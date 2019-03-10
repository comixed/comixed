/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Comic } from '../../../../models/comics/comic';

@Component({
  selector: 'app-comic-grid-item',
  templateUrl: './comic-grid-item.component.html',
  styleUrls: ['./comic-grid-item.component.css']
})
export class ComicGridItemComponent implements OnInit {
  @Input() comic: Comic;
  @Input() same_height: boolean;
  @Input() cover_size: number;
  @Input() selected = false;
  @Output() toggleSelected = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  toggle_selected(): void {
    this.toggleSelected.next(!this.selected);
  }
}
