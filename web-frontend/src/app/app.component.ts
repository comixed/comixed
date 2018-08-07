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
import {Router} from '@angular/router';

import {ComicService} from './comic/comic.service';
import {ErrorsService} from './errors.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ComicService, ErrorsService],
})
export class AppComponent implements OnInit {
  title = 'ComixEd';
  error_message: string;
  comic_count = 0;
  read_count = 0;

  constructor(private comicService: ComicService, private errorsService: ErrorsService, private router: Router) {
  }

  ngOnInit() {
    this.errorsService.error_messages.subscribe(
      (message: string) => {
        this.error_message = message;
      }
    );
    setInterval(() => {
      this.comicService.get_library_comic_count().subscribe(
        count => this.comic_count = count,
        error => console.log('ERROR:', error.message));
    }, 250);
  }

  logout(): void {
    this.comicService.logout().subscribe(
      () => {
        this.router.navigateByUrl('/login');
      }
    );
  }

  clearErrorMessage(): void {
    this.error_message = '';
  }

  isAuthenticated(): boolean {
    return this.comicService.isAuthenticated();
  }

  is_admin(): boolean {
    if (this.comicService.isAuthenticated()) {
      for (const role of this.comicService.get_user().authorities) {
        if (role.authority === 'ROLE_ADMIN') {
          return true;
        }
      }
    }
    return false;
  }
}
