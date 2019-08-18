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
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor, User } from 'app/user';
import { LibraryAdaptor } from 'app/library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ComiXed';

  user: User;
  authenticated = false;
  show_login = false;
  comic_count = 0;
  import_count = 0;
  rescan_count = 0;
  fetching_update_subscription: Subscription;

  constructor(
    private translate_service: TranslateService,
    private auth_adaptor: AuthenticationAdaptor,
    private library_adaptor: LibraryAdaptor
  ) {
    translate_service.setDefaultLang('en');
  }

  ngOnInit() {
    this.auth_adaptor.user$.subscribe(user => {
      this.user = user;
    });
    this.auth_adaptor.authenticated$.subscribe(authenticated => {
      this.authenticated = authenticated;
      if (this.authenticated && !this.fetching_update_subscription) {
        this.fetching_update_subscription = this.library_adaptor._fetching_update$.subscribe(
          fetching => {
            if (!fetching) {
              this.library_adaptor.get_comic_updates();
            }
          }
        );
      } else if (!this.authenticated && this.fetching_update_subscription) {
        this.fetching_update_subscription.unsubscribe();
        this.fetching_update_subscription = null;
        this.library_adaptor.reset_library();
      }
    });
    this.auth_adaptor.show_login$.subscribe(show_login => {
      this.show_login = show_login;
    });
    this.auth_adaptor.get_current_user();

    this.library_adaptor.comic$.subscribe(
      comics => (this.comic_count = comics.length)
    );
    this.library_adaptor.pending_import$.subscribe(
      imports => (this.import_count = imports)
    );
    this.library_adaptor.pending_rescan$.subscribe(
      rescans => (this.rescan_count = rescans)
    );
  }
}
