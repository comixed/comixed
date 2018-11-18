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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { AppState } from './app.state';
import { Library } from './models/library';
import { BusyIndicatorComponent } from './busy-indicator/busy-indicator.component';
import { UserService } from './services/user.service';
import { MenubarComponent } from './ui/components/menubar/menubar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'ComiXed';
  alert_messages = [];
  comic_count = 0;
  read_count = 0;

  library: Library;

  constructor(
    private user_service: UserService,
    private router: Router,
    private store: Store<AppState>,
  ) {
  }

  ngAfterViewInit(): void {
    this.store.select('library').subscribe(
      (library: Library) => {
        this.comic_count = library.comics.length;
      });
  }

  logout(): void {
    this.user_service.logout().subscribe(
      () => {
        this.router.navigateByUrl('/login');
      }
    );
  }

  clear_alert_message(index: number): void {
    if (this.alert_messages.length > index) {
      if (this.alert_messages[index].length > 2) {
        // cancel the timer if clear was clicked before it fired
        const timeout = this.alert_messages[index][2];
        clearTimeout(timeout);
      }
      this.alert_messages.splice(index, 1);
    }
  }

  clear_info_message(message: string): void {
    const index = this.alert_messages.findIndex((alert_message: any) => {
      return alert_message[0] === message;
    });
    this.clear_alert_message(index);
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
