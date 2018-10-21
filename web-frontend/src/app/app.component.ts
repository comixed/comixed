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

interface AlertMessage {
  message: string;
  class: string;
  timer?: any;
}

interface AlertMessages {
  [id: number]: AlertMessage;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'ComiXed';
  object_keys = Object.keys;
  alert_messages: AlertMessages = {};
  alert_runningId = 0;
  alert_count = 0;
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
        const alertId = this.alert_runningId++;
        this.alert_messages[alertId] = { message, class: 'alert-danger' };
        this.alert_count++;
      }
    );

    this.alert_service.info_messages.subscribe(
      (message: string) => {
        const alertId = this.alert_runningId++;
        this.alert_messages[alertId] = { message, class: 'alert-info' };
        this.alert_count++;

        // create a timer to remove this info message after 5 seconds
        const timer = setTimeout(() => { this.clear_alert_message(alertId); }, 5000);
        this.alert_messages[alertId].timer = timer;
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

  clear_alert_message(alertId: number): void {
    if (this.alert_messages[alertId]) {
      if (this.alert_messages[alertId].timer) {
        // cancel the timer if clear was clicked before it fired
        clearTimeout(this.alert_messages[alertId].timer);
      }
      delete this.alert_messages[alertId];
      this.alert_count--;
    }
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
