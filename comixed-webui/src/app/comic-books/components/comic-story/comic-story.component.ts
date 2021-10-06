/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Comic } from '@app/comic-books/models/comic';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'cx-comic-story',
  templateUrl: './comic-story.component.html',
  styleUrls: ['./comic-story.component.scss']
})
export class ComicStoryComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  @Input() comic: Comic;

  constructor() {}

  ngOnInit(): void {}
}
