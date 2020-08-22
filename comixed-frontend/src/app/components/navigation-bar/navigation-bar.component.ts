/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnInit } from '@angular/core';
import { LoggerLevel, LoggerService } from '@angular-ru/logger';
import { AuthenticationAdaptor, User } from 'app/user';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/api';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LibraryAdaptor } from 'app/library';

export const USER_PREFERENCE_DEBUGGING = 'user-preference.debugging';
export const USER_PREFERENCE_LANGUAGE = 'user-preference.language';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  private _user = null;
  authenticated = false;
  isAdmin = false;
  debugging = false;
  menuItems: MenuItem[] = [];
  languageOptions: SelectItem[] = [];
  language = 'en';

  constructor(
    public logger: LoggerService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor
  ) {
    this.logger.trace('creating the navigation bar');
    this.authenticationAdaptor.user$.subscribe(user => (this.user = user));
    this.authenticationAdaptor.authenticated$.subscribe(authenticated => {
      this.authenticated = authenticated;
      this.loadMenu();
    });
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadTranslations();
      this.logger.debug(`loading translation: ${event.lang}`);
    });
    this.loadTranslations();
  }

  ngOnInit() {}

  set user(user: User) {
    this._user = user;
    if (!!this._user) {
      this.logger.debug('loaded user:', this.user);
      this.isAdmin = this.authenticationAdaptor.isAdmin;
      this.debugging =
        (this.authenticationAdaptor.getPreference(USER_PREFERENCE_DEBUGGING) ||
          'false') === 'true';
      this.language =
        this.authenticationAdaptor.getPreference(USER_PREFERENCE_LANGUAGE) ||
        'en';
      this.translateService.use(this.language);
      this.loadMenu();
    } else {
      this.logger.debug('loading user defaults');
      this.isAdmin = false;
      this.debugging = false;
      this.translateService.use('en');
      this.loadMenu();
    }
  }

  get user(): User {
    return this._user;
  }

  private loadMenu() {
    this.menuItems = [
      {
        label: this.translateService.instant('main-menu.item.library.root'),
        icon: 'fa fa-fw fa-book',
        items: [
          {
            label: this.translateService.instant(
              'main-menu.item.library.comics'
            ),
            icon: 'fas fa-book-reader',
            routerLink: ['/comics'],
            visible: this.authenticated
          },
          {
            separator: true,
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.library.duplicates'
            ),
            icon: 'fa fw fas fa-clone',
            routerLink: ['/comics/duplicates'],
            visible: this.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.account.login'
            ),
            icon: 'fa fa-fw fa-sign-in-alt',
            command: () => this.authenticationAdaptor.startLogin(),
            visible: !this.authenticated
          }
        ]
      },
      {
        separator: true,
        visible: this.isAdmin
      },
      {
        label: this.translateService.instant('main-menu.item.admin.root'),
        icon: 'fas fa-cogs',
        visible: this.isAdmin,
        items: [
          {
            label: this.translateService.instant('main-menu.item.admin.users'),
            icon: 'fas fa-users',
            visible: this.isAdmin,
            routerLink: ['/admin/users']
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.library'
            ),
            icon: 'fas fa-book-open',
            visible: this.isAdmin,
            routerLink: ['/admin/library']
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.plugins'
            ),
            icon: 'fa fa-fw fa-plus-square',
            visible: this.isAdmin,
            routerLink: ['/admin/plugins']
          },
          {
            label: this.translateService.instant('main-menu.item.admin.import'),
            icon: 'fas fa-file-import',
            routerLink: ['/import'],
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.duplicate-pages'
            ),
            icon: 'fas fa-smog',
            routerLink: ['/duplicates'],
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.missing-comics'
            ),
            icon: 'fas fa-ghost',
            routerLink: ['/comics/missing'],
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.task-audit-log'
            ),
            icon: 'fa fa-fw fas fa-tasks',
            routerLink: ['/admin/tasks/logs'],
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.rest-audit-log'
            ),
            icon: 'fa fa-fw fas fa-spider',
            routerLink: ['/admin/logs/rest'],
            visible: this.isAdmin
          },
          {
            label: this.translateService.instant(
              'main-menu.item.admin.clear-image-cache'
            ),
            icon: 'fa fa-fw fa-trash',
            command: () => this.libraryAdaptor.clearImageCache(),
            visible: this.isAdmin
          }
        ]
      },
      {
        separator: true,
        visible: this.authenticated
      },
      {
        label: this.translateService.instant('main-menu.item.account.root'),
        icon: 'fa fa-fw fa-user',
        visible: this.authenticated,
        items: [
          {
            label: this.translateService.instant(
              'main-menu.item.account.details'
            ),
            routerLink: ['/account'],
            icon: 'fa fa-fw fa-user',
            visible: this.authenticated
          },
          {
            label: this.translateService.instant(
              'main-menu.item.account.logout'
            ),
            icon: 'fa fa-fw fa-sign-in-alt',
            command: () => this.logout(),
            visible: this.authenticated
          }
        ]
      },
      {
        separator: true,
        visible: this.authenticated
      },
      {
        label: this.translateService.instant('main-menu.item.help.root'),
        icon: 'fas fa-question',
        items: [
          {
            label: this.translateService.instant(
              'main-menu.item.help.build-details'
            ),
            icon: 'fa fa-fw fas fa-landmark',
            routerLink: ['/build/details']
          },
          {
            label: this.translateService.instant(
              'main-menu.item.help.enable-debugging'
            ),
            icon: 'fa fa-fw fas fa-bug',
            visible: this.isAdmin && !this.debugging,
            command: () => this.toggleDebugging(true)
          },
          {
            label: this.translateService.instant(
              'main-menu.item.help.disable-debugging'
            ),
            icon: 'fa fa-fw fas fa-bug',
            visible: this.isAdmin && this.debugging,
            command: () => this.toggleDebugging(false)
          }
        ]
      }
    ];
  }

  toggleDebugging(debugging: boolean) {
    this.logger.info(`toggling debugging output ${debugging ? 'on' : 'off'}`);
    this.debugging = debugging;
    this.logger.level = this.debugging ? LoggerLevel.DEBUG : LoggerLevel.INFO;
    if (!!this.user) {
      this.authenticationAdaptor.setPreference(
        USER_PREFERENCE_DEBUGGING,
        this.debugging ? 'true' : 'false'
      );
    }
    this.loadMenu();
  }

  private loadTranslations() {
    this.loadMenu();
    this.loadLanguages();
  }

  private loadLanguages() {
    this.languageOptions = [
      {
        label: this.translateService.instant('language.option.english'),
        value: 'en'
      },
      {
        label: this.translateService.instant('language.option.french'),
        value: 'fr'
      },
      {
        label: this.translateService.instant('language.option.spanish'),
        value: 'es'
      },
      {
        label: this.translateService.instant('language.option.portuguese'),
        value: 'pt'
      }
    ];
  }

  changeLanguage(language: string) {
    this.logger.debug(`language changed to ${language}`);
    this.language = language;
    this.translateService.use(language);
    if (!!this.user) {
      this.authenticationAdaptor.setPreference(
        USER_PREFERENCE_LANGUAGE,
        language
      );
    }
  }

  logout(): void {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'global.confirmation.logout.header'
      ),
      message: this.translateService.instant(
        'global.confirmation.logout.message'
      ),
      icon: 'fa fa-exclamation',
      accept: () => this.authenticationAdaptor.startLogout()
    });
  }
}
