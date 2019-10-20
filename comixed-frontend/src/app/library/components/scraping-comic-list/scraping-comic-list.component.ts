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

import { Component, Input, OnInit } from '@angular/core';
import { Comic } from 'app/library';

@Component({
  selector: 'app-scraping-comic-list',
  templateUrl: './scraping-comic-list.component.html',
  styleUrls: ['./scraping-comic-list.component.scss']
})
export class ScrapingComicListComponent implements OnInit {
  private _comics: Comic[];

  constructor() {}

  ngOnInit() {}

  @Input()
  set comics(comics: Comic[]) {
    this._comics = comics.sort((left: Comic, right: Comic) => {
      if (left.baseFilename < right.baseFilename) {
        return -1;
      }
      if (left.baseFilename > right.baseFilename) {
        return 1;
      }

      return 0;
    });
  }

  get comics(): Comic[] {
    return this._comics;
  }
}
