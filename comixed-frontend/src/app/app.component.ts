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

import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor, User } from 'app/user';
import { LibraryAdaptor } from 'app/library';
import { Subscription } from 'rxjs';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { MenuItem } from 'primeng/api';
import { MainMenuComponent } from 'app/components/main-menu/main-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(MainMenuComponent)
  mainmenu: MainMenuComponent;

  title = 'ComiXed';

  user: User;

  authenticated = false;
  showLogin = false;
  comicCount = 0;
  processingCount = 0;
  rescanCount = 0;
  fetchingUpdateSubscription: Subscription;
  breadcrumbs = [];
  home = {
    icon: 'fa fas fa-bars',
    command: (event: any) => this.mainmenu.toggle(event)
  } as MenuItem;

  constructor(
    private translateService: TranslateService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private breadcrumbsAdaptor: BreadcrumbAdaptor
  ) {
    translateService.setDefaultLang('en');
  }

  ngOnInit() {
    this.authenticationAdaptor.user$.subscribe(user => {
      this.user = user;
    });
    this.authenticationAdaptor.authenticated$.subscribe(authenticated => {
      this.authenticated = authenticated;
      if (this.authenticated && !this.fetchingUpdateSubscription) {
        this.fetchingUpdateSubscription = this.libraryAdaptor._fetchingUpdate$.subscribe(
          fetching => {
            if (!fetching) {
              this.libraryAdaptor.getLibraryUpdates();
            }
          }
        );
      } else if (!this.authenticated && this.fetchingUpdateSubscription) {
        this.fetchingUpdateSubscription.unsubscribe();
        this.fetchingUpdateSubscription = null;
        this.libraryAdaptor.resetLibrary();
      }
    });
    this.authenticationAdaptor.showLogin$.subscribe(show_login => {
      this.showLogin = show_login;
    });
    this.authenticationAdaptor.getCurrentUser();

    this.libraryAdaptor.comic$.subscribe(
      comics => (this.comicCount = comics.length)
    );
    this.libraryAdaptor.processingCount$.subscribe(
      imports => (this.processingCount = imports)
    );
    this.libraryAdaptor.rescanCount$.subscribe(
      rescans => (this.rescanCount = rescans)
    );
    this.breadcrumbsAdaptor.entries$.subscribe(
      entries => (this.breadcrumbs = entries)
    );
  }
}
