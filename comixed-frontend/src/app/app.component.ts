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
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { AppState } from 'app/app.state';
import { LibraryState } from 'app/models/state/library-state';
import * as LibraryActions from 'app/actions/library.actions';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { User } from 'app/models/user';
import { AuthenticationState } from 'app/models/state/authentication-state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ComiXed';

  user: User;
  show_login = false;
  fetching_comics = false;

  library$: Observable<LibraryState>;
  library_subscription: Subscription;
  library: LibraryState;

  constructor(
    private translate_service: TranslateService,
    private store: Store<AppState>,
    private auth_adaptor: AuthenticationAdaptor
  ) {
    translate_service.setDefaultLang('en');
    this.library$ = store.select('library');
  }

  ngOnInit() {
    this.auth_adaptor.auth_state$.subscribe(
      (auth_state: AuthenticationState) => {
        this.user = auth_state.user;
        this.show_login = auth_state.show_login;

        if (this.auth_adaptor.authenticated && !this.fetching_comics) {
          this.fetching_comics = true;
          this.store.dispatch(
            new LibraryActions.LibraryFetchLibraryChanges({
              last_comic_date: '0',
              timeout: 60000
            })
          );
        }

        if (!this.auth_adaptor.authenticated && this.fetching_comics) {
          this.store.dispatch(new LibraryActions.LibraryReset());
          this.fetching_comics = false;
        }
      }
    );
    this.auth_adaptor.get_current_user();
    this.library_subscription = this.library$.subscribe(
      (library: LibraryState) => {
        this.library = library;

        // if we're not busy, then get the scan types, formats or updates as needed
        if (!this.library.busy) {
          if (
            !this.library.scan_types ||
            this.library.scan_types.length === 0
          ) {
            this.store.dispatch(new LibraryActions.LibraryGetScanTypes());
          } else if (this.library.formats.length === 0) {
            this.store.dispatch(new LibraryActions.LibraryGetFormats());
          } else if (this.auth_adaptor.authenticated) {
            // if the last time we checked the library, we got either an import or a rescan count,
            // then set the timeout value to 0
            this.store.dispatch(
              new LibraryActions.LibraryFetchLibraryChanges({
                last_comic_date: `${this.library.last_comic_date}`,
                timeout: 60000
              })
            );
          }
        }
      }
    );
  }
}
