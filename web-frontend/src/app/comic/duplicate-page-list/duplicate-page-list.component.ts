/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import {Component, OnInit} from '@angular/core';

import {ComicService} from '../comic.service';
import {Page} from '../page.model';
import {DuplicatePageListEntryComponent} from '../duplicate-page-list-entry/duplicate-page-list-entry.component';

@Component({
  selector: 'app-duplicate-page-list',
  templateUrl: './duplicate-page-list.component.html',
  styleUrls: ['./duplicate-page-list.component.css']
})
export class DuplicatePageListComponent implements OnInit {
  count: number;
  pages: Page[];

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    this.comicService.getDuplicatePageCount().subscribe(
      count => {
        this.count = count;
      });
    this.comicService.getDuplicatePages().subscribe(
      pages => {
        this.pages = pages.sort((a, b) => {
          if (a.hash < b.hash) {
            return -1;
          }
          if (a.hash > b.hash) {
            return 1;
          }
          return 0;
        });
      });
  }
}
