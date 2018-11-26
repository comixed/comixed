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

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppState } from './app.state';
import { Library } from './models/library';
import * as LibraryActions from './actions/library.actions';
import { UserService } from './services/user.service';
import { ComicService } from './services/comic.service';
import { AlertService } from './services/alert.service';
import { MenubarComponent } from './ui/components/menubar/menubar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'ComiXed';
  alert_messages = [];
  comic_count = 0;
  read_count = 0;

  library$: Observable<Library>;
  library_subscription: Subscription;
  library: Library;

  alert_message: string;
  busy = false;

  constructor(
    private user_service: UserService,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private router: Router,
    private store: Store<AppState>,
  ) {
    this.library$ = store.select('library');
    this.alert_service.busy_messages.subscribe(
      (message: string) => {
        this.alert_message = message || '';
        this.busy = (this.alert_message != null) && (this.alert_message.length > 0);
      });
  }

  ngOnInit() {
    this.library_subscription = this.library$.subscribe(
      (library: Library) => {
        this.library = library;
        // if we're not fetching comics now then fire off a call
        if (!this.library.busy) {
          this.store.dispatch(new LibraryActions.LibraryFetchLibraryChanges({
            last_comic_date: this.library.last_comic_date,
          }));
        }
      });
    this.store.dispatch(new LibraryActions.LibraryFetchLibraryChanges({ last_comic_date: '0' }));
  }

  ngOnDestroy() {
    this.library_subscription.unsubscribe();
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
