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

import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusyIndicatorComponent } from './busy-indicator/busy-indicator.component';
import { UserService } from './user.service';
import { AlertService } from './alert.service';
import { ComicService } from './comic/comic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'ComiXed';
  alert_type: string;
  alert_messages = [];
  comic_count = 0;
  read_count = 0;

  constructor(
    private user_service: UserService,
    private alert_service: AlertService,
    private comic_service: ComicService,
    private router: Router,
  ) {
  }

  ngAfterViewInit(): void {
    this.alert_service.error_messages.subscribe(
      (message: string) => {
        this.alert_messages.push([message, 'alert-danger']);
      }
    );
    this.alert_service.info_messages.subscribe(
      (message: string) => {
        this.alert_messages.push([message, 'alert-info']);
      }
    );

    this.comic_service.get_library_comic_count().subscribe(
      count => this.comic_count = count,
      error => console.log('ERROR:', error.message));
  }

  logout(): void {
    this.user_service.logout().subscribe(
      () => {
        this.router.navigateByUrl('/login');
      }
    );
  }

  clear_error_message(index: number): void {
    this.alert_messages.splice(index, 1);
  }

  is_authenticated(): boolean {
    return this.user_service.is_authenticated();
  }

  is_admin(): boolean {
    if (this.user_service.is_authenticated()) {
      for (const role of this.user_service.get_user().roles) {
        if (role.name === 'ADMIN') {
          return true;
        }
      }
    }
    return false;
  }
}
