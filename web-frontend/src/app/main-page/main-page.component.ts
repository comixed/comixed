/*
 * ComixEd - A digital comic book library management application.
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

import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {ComicService} from '../comic/comic.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  public comicCount: number;
  public plural = false;
  public duplicate_pages = 0;

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    this.comicService.getComicCount().subscribe(
      res => {
        this.comicCount = res;
        this.plural = res !== 1;
      },
      err => {
        console.log(err);
      }
    );
    this.comicService.getDuplicatePageCount().subscribe(
      res => {
        this.duplicate_pages = res;
      },
      error => {
        console.log('ERROR: ' + error.message);
      }
    );
  }
}
