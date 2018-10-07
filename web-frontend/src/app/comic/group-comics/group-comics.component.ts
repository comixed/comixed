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

import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-group-comics',
  templateUrl: './group-comics.component.html',
  styleUrls: ['./group-comics.component.css']
})
export class GroupComicsComponent {
  @Input() initial: number;

  protected group_by_options: any[] = [
    { id: 0, label: 'Not grouped' },
    { id: 1, label: 'Series' },
    { id: 2, label: 'Publisher' },
    { id: 3, label: 'Year published' },
  ];

  constructor() { }
}
