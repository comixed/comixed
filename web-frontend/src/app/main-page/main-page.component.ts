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

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ComicService } from '../services/comic.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  public comicCount: number;
  public plural = false;

  constructor(
    private comicService: ComicService,
    private alert_service: AlertService,
  ) { }

  ngOnInit() {
    this.comicService.get_library_comic_count().subscribe(
      res => {
        this.comicCount = res;
        this.plural = res !== 1;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to get the library comic count...', error);
      }
    );
  }
}
