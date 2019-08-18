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

import { Component, Input, OnInit } from '@angular/core';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';

@Component({
  selector: 'app-comic-grouping-card',
  templateUrl: './comic-grouping-card.component.html',
  styleUrls: ['./comic-grouping-card.component.css']
})
export class ComicGroupingCardComponent implements OnInit {
  @Input() details: ComicCollectionEntry;
  @Input() parent_route: string;

  constructor() {}

  ngOnInit() {}
}
