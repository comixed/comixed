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

import { Component, OnInit, Input } from '@angular/core';
import { Comic } from '../../../../models/comics/comic';
import { Library, ComicGrouping } from '../../../../models/actions/library';

@Component({
  selector: 'app-comic-story',
  templateUrl: './comic-story.component.html',
  styleUrls: ['./comic-story.component.css']
})
export class ComicStoryComponent implements OnInit {
  @Input() comic: Comic;
  @Input() library: Library;

  constructor() {}

  ngOnInit() {}

  get_details_for(
    source: Array<ComicGrouping>,
    character: string
  ): ComicGrouping {
    return source.find((grouping: ComicGrouping) => {
      return grouping.name === character;
    });
  }
}
