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
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { AuthenticationState } from 'app/models/state/authentication-state';
import { User } from 'app/models/user';
import { Roles } from 'app/models/ui/roles';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  menu_items: Array<MenuItem>;
  user: User;
  authenticated = false;
  is_admin = false;
  is_reader = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private auth_adaptor: AuthenticationAdaptor
  ) {}

  ngOnInit() {
    this.auth_adaptor.user$.subscribe((user: User) => {
      this.user = user;
      this.update_menu();
    });
    this.auth_adaptor.authenticated$.subscribe((authenticated: boolean) => {
      this.authenticated = authenticated;
      this.update_menu();
    });
    this.auth_adaptor.role$.subscribe((roles: Roles) => {
      this.is_admin = roles.is_admin;
      this.is_reader = roles.is_reader;
      this.update_menu();
    });
    this.update_menu();
  }

  do_login(): void {
    this.auth_adaptor.start_login();
  }

  do_logout(): void {
    this.auth_adaptor.start_logout();
    this.router.navigate(['/home']);
  }

  private update_menu() {
    this.menu_items = [
      {
        label: this.translate.instant('menu.home.root'),
        icon: 'fa fa-fw fa-home',
        routerLink: ['/']
      }
    ];
    if (this.is_reader) {
      this.menu_items = this.menu_items.concat(this.add_comics_menu());
    }
    if (this.is_admin) {
      this.menu_items = this.menu_items.concat(this.add_admin_menu());
    }
  }

  private add_comics_menu(): Array<MenuItem> {
    return [
      {
        label: this.translate.instant('menu.library.root'),
        icon: 'fa fa-fw fa-book',
        visible: this.authenticated,
        items: [
          {
            label: this.translate.instant('menu.library.comics'),
            icon: 'fas fa-book-reader',
            routerLink: ['/comics'],
            visible: this.authenticated
          },
          {
            separator: true,
            visible: this.is_admin
          },
          {
            label: this.translate.instant('menu.library.reading-lists'),
            icon: 'fas fa-glasses',
            routerLink: ['/lists'],
            visible: this.authenticated
          },
          {
            label: this.translate.instant('menu.library.collections.label'),
            icon: 'fas fa-bookmark',
            items: [
              {
                label: this.translate.instant(
                  'menu.library.collections.publishers'
                ),
                icon: 'fas fa-newspaper',
                routerLink: ['/publishers'],
                visible: this.authenticated
              },
              {
                label: this.translate.instant(
                  'menu.library.collections.series'
                ),
                icon: 'fa fa-fw fa-book',
                routerLink: ['/series'],
                visible: this.authenticated
              },
              {
                label: this.translate.instant(
                  'menu.library.collections.characters'
                ),
                icon: 'fas fa-user',
                routerLink: ['/characters'],
                visible: this.authenticated
              },
              {
                label: this.translate.instant('menu.library.collections.teams'),
                icon: 'fas fa-users',
                routerLink: ['/teams'],
                visible: this.authenticated
              },
              {
                label: this.translate.instant(
                  'menu.library.collections.locations'
                ),
                icon: 'fas fa-location-arrow',
                routerLink: ['/locations'],
                visible: this.authenticated
              },
              {
                label: this.translate.instant(
                  'menu.library.collections.story-arcs'
                ),
                icon: 'fas fa-folder-open',
                routerLink: ['/stories'],
                visible: this.authenticated
              }
            ]
          }
        ]
      }
    ];
  }

  private add_admin_menu(): Array<MenuItem> {
    return [
      {
        label: this.translate.instant('menu.admin.root'),
        icon: 'fas fa-tools',
        visible: this.is_admin,
        items: [
          {
            label: this.translate.instant('menu.admin.users'),
            icon: 'fas fa-user-cog',
            visible: this.is_admin,
            routerLink: ['/admin/users']
          },
          {
            separator: true,
            visible: this.is_admin
          },
          {
            label: this.translate.instant('menu.admin.library'),
            icon: 'fas fa-book-open',
            visible: this.is_admin,
            routerLink: ['/admin/library']
          },
          {
            label: this.translate.instant('menu.library.import'),
            icon: 'fas fa-file-import',
            routerLink: ['/import'],
            visible: this.is_admin
          },
          {
            label: this.translate.instant('menu.library.duplicate-pages'),
            icon: 'fas fa-smog',
            routerLink: ['/pages/duplicates'],
            visible: this.is_admin
          },
          {
            label: this.translate.instant('menu.library.missing-comics'),
            icon: 'fas fa-ghost',
            routerLink: ['/comics/missing'],
            visible: this.is_admin
          }
        ]
      }
    ];
  }
}
