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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from './app.state';
import { Library } from './models/library';
import * as LibraryActions from './actions/library.actions';
import { User } from './models/user/user';
import * as UserActions from './actions/user.actions';
import { UserService } from './services/user.service';
import { ComicService } from './services/comic.service';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ComiXed';
  alert_messages = [];
  comic_count = 0;
  read_count = 0;
  import_count = 0;
  rescan_count = 0;

  user$: Observable<User>;
  user_subscription: Subscription;
  user: User;

  library$: Observable<Library>;
  library_subscription: Subscription;
  library: Library;

  alert_message: string;

  constructor(
    private user_service: UserService,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.user$ = store.select('user');
    this.library$ = store.select('library');
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe(
      (user: User) => {
        this.user = user;

        if (!this.user.authenticated && this.library && this.library.comics && this.library.comics.length) {
          this.store.dispatch(new LibraryActions.LibraryReset());
        } else if (this.user.token && !this.user.email && !this.user.fetching) {
          this.store.dispatch(new UserActions.UserAuthCheck());
          this.store.dispatch(new LibraryActions.LibraryReset());
          this.store.dispatch(new LibraryActions.LibraryFetchLibraryChanges({
            last_comic_date: '0',
            timeout: 60000,
          }));
        }
      });
    this.store.dispatch(new UserActions.UserAuthCheck());
    this.library_subscription = this.library$.subscribe(
      (library: Library) => {
        this.library = library;

        this.comic_count = library.comics.length;
        this.read_count = 0;
        this.import_count = library.import_count;
        this.rescan_count = library.rescan_count;

        // if we're not busy, then get the scan types, formats or updates as needed
        if (!this.library.busy) {
          if (this.library.scan_types.length === 0) {
            this.store.dispatch(new LibraryActions.LibraryGetScanTypes());
          } else if (this.library.formats.length === 0) {
            this.store.dispatch(new LibraryActions.LibraryGetFormats());
          } else if (this.user && this.user.authenticated) {
            // if the last time we checked the library, we got either an import or a rescan count,
            // then set the timeout value to 0
            const timeout = (this.library.import_count === 0) &&
              (this.library.rescan_count === 0) ? 60000 : 0;
            this.store.dispatch(new LibraryActions.LibraryFetchLibraryChanges({
              last_comic_date: `${this.library.last_comic_date}`,
              timeout: timeout,
            }));
          }
        }
      });
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
  }

  logout(): void {
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
    return this.user && this.user.authenticated;
  }

  is_admin(): boolean {
    if (this.is_authenticated()) {
      for (const role of this.user.roles) {
        if (role.name === 'ADMIN') {
          return true;
        }
      }
    }
    return false;
  }
}
