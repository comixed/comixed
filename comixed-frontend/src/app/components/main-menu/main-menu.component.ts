/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 *t
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AuthenticationAdaptor, User } from 'app/user';
import { TieredMenu } from 'primeng/primeng';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  @ViewChild(TieredMenu)
  menu: TieredMenu;

  items: MenuItem[];
  private user: User;

  constructor(
    private translateService: TranslateService,
    private authenticationAdaptor: AuthenticationAdaptor
  ) {}

  toggle(event: any): void {
    this.menu.toggle(event);
  }

  ngOnInit() {
    this.translateService.onLangChange.subscribe(() => this.loadMenuItems());
    this.authenticationAdaptor.user$.subscribe(user => {
      this.user = user;
      this.loadMenuItems();
    });
  }

  private loadMenuItems() {
    this.items = [
      {
        label: this.translateService.instant('main-menu.item.library.root'),
        icon: 'fa fa-fw fa-book',
        visible: this.authenticationAdaptor.authenticated,
        items: [
          {
            label: this.translateService.instant(
              'main-menu.item.library.comics'
            ),
            icon: 'fas fa-book-reader',
            routerLink: ['/comics'],
            visible: this.authenticationAdaptor.authenticated
          },
          {
            separator: true,
            visible: this.authenticationAdaptor.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.library.reading-lists'
            ),
            icon: 'fas fa-glasses',
            routerLink: ['/lists'],
            visible: this.authenticationAdaptor.authenticated
          }
        ]
      },
      {
        label: this.translateService.instant('main-menu.item.collections.root'),
        icon: 'fas fa-bookmark',
        visible: this.authenticationAdaptor.isReader,
        items: [
          {
            label: this.translateService.instant(
              'main-menu.item.collections.publishers'
            ),
            icon: 'fas fa-newspaper',
            routerLink: ['/publishers'],
            visible: this.authenticationAdaptor.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.collections.series'
            ),
            icon: 'fa fa-fw fa-book',
            routerLink: ['/series'],
            visible: this.authenticationAdaptor.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.collections.characters'
            ),
            icon: 'fas fa-user',
            routerLink: ['/characters'],
            visible: this.authenticationAdaptor.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.collections.teams'
            ),
            icon: 'fas fa-users',
            routerLink: ['/teams'],
            visible: this.authenticationAdaptor.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.collections.locations'
            ),
            icon: 'fas fa-location-arrow',
            routerLink: ['/locations'],
            visible: this.authenticationAdaptor.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.collections.story-arcs'
            ),
            icon: 'fas fa-folder-open',
            routerLink: ['/stories'],
            visible: this.authenticationAdaptor.authenticated
          }
        ]
      },
      {
        separator: true,
        visible: this.authenticationAdaptor.isAdmin
      },
      {
        label: this.translateService.instant('main-menu.item.admin.root'),
        icon: 'fas fa-cogs',
        visible: this.authenticationAdaptor.isAdmin,
        items: [
          {
            label: this.translateService.instant('main-menu.item.admin.users'),
            icon: 'fas fa-users',
            visible: this.authenticationAdaptor.isAdmin,
            routerLink: ['/admin/users']
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.library'
            ),
            icon: 'fas fa-book-open',
            visible: this.authenticationAdaptor.isAdmin,
            routerLink: ['/admin/library']
          },
          {
            label: this.translateService.instant('main-menu.item.admin.import'),
            icon: 'fas fa-file-import',
            routerLink: ['/import'],
            visible: this.authenticationAdaptor.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.duplicate-pages'
            ),
            icon: 'fas fa-smog',
            routerLink: ['/pages/duplicates'],
            visible: this.authenticationAdaptor.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.missing-comics'
            ),
            icon: 'fas fa-ghost',
            routerLink: ['/comics/missing'],
            visible: this.authenticationAdaptor.isAdmin
          }
        ]
      },
      {
        separator: true,
        visible: this.authenticationAdaptor.authenticated
      },
      {
        label: this.translateService.instant('main-menu.item.account'),
        icon: 'fa fa-fw fa-user',
        routerLink: ['/account'],
        visible: this.authenticationAdaptor.authenticated
      },
      {
        separator: true,
        visible: this.authenticationAdaptor.authenticated
      },
      {
        label: this.translateService.instant('main-menu.item.help.root'),
        icon: 'fas fa-question',
        items: [
          {
            label: this.translateService.instant(
              'main-menu.item.help.build-details'
            ),
            icon: 'fas fa-landmark',
            routerLink: ['/build/details']
          }
        ]
      },
      {
        label: this.translateService.instant('main-menu.item.login'),
        icon: 'fa fa-fw fa-sign-in-alt',
        command: () => this.authenticationAdaptor.startLogin(),
        visible: !this.authenticationAdaptor.authenticated
      },
      {
        label: this.translateService.instant('main-menu.item.logout'),
        icon: 'fa fa-fw fa-sign-in-alt',
        command: () => this.authenticationAdaptor.startLogout(),
        visible: this.authenticationAdaptor.authenticated
      }
    ];
  }
}
