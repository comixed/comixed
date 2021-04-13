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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@app/user';
import { LoggerLevel, LoggerService } from '@angular-ru/logger';
import { Router } from '@angular/router';
import { ConfirmationService, SelectionOption } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { logoutUser, saveUserPreference } from '@app/user/actions/user.actions';
import { Store } from '@ngrx/store';
import { isAdmin, isReader } from '@app/user/user.functions';
import { MatDialog } from '@angular/material/dialog';
import { ComicDisplayOptionsComponent } from '@app/library/components/comic-display-options/comic-display-options.component';
import {
  LANGUAGE_PREFERENCE,
  LOGGER_LEVEL_PREFERENCE
} from '@app/app.constants';
import { ComicViewMode } from '@app/library';
import { ComicCollection } from '@app/library/models/comic-collection.enum';

@Component({
  selector: 'cx-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  isReader = false;
  isAdmin = false;
  readonly languages = ['en', 'fr', 'es', 'pt'];
  currentLanguage = '';
  readonly loggingOptions = [
    LoggerLevel.INFO,
    LoggerLevel.DEBUG,
    LoggerLevel.TRACE,
    LoggerLevel.ALL
  ];
  readonly comicOptions: SelectionOption<any>[] = [
    { label: 'all', value: ComicViewMode.ALL },
    { label: 'newest', value: ComicViewMode.NEWEST },
    { label: 'recently-read', value: ComicViewMode.RECENTLY_READ },
    { label: 'unread', value: ComicViewMode.UNREAD }
  ];
  stacked = false;
  readingLists: string[] = [];
  readonly collectionOptions: SelectionOption<ComicCollection>[] = [
    { label: 'publishers', value: ComicCollection.PUBLISHERS },
    { label: 'series', value: ComicCollection.SERIES },
    { label: 'characters', value: ComicCollection.CHARACTERS },
    { label: 'teams', value: ComicCollection.TEAMS },
    { label: 'locations', value: ComicCollection.LOCATIONS },
    { label: 'stories', value: ComicCollection.STORIES }
  ];

  constructor(
    private logger: LoggerService,
    private router: Router,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this.translateService.onLangChange.subscribe(language => {
      this.logger.debug('Active language changed:', language.lang);
      this.currentLanguage = language.lang;
    });
  }

  private _user: User;

  get user(): User {
    return this._user;
  }

  @Input()
  set user(user: User) {
    this.logger.trace('Setting user');
    this._user = user;
    this.isReader = isReader(user);
    this.isAdmin = isAdmin(user);
  }

  onLogin(): void {
    this.logger.trace('Navigating to the login page');
    this.router.navigate(['login']);
  }

  onLogout(): void {
    this.logger.trace('Logout button clicked');
    this.confirmationService.confirm({
      title: this.translateService.instant('user.logout.confirmation-title'),
      message: this.translateService.instant(
        'user.logout.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('User logged out');
        this.store.dispatch(logoutUser());
        this.router.navigate(['login']);
      }
    });
  }

  onShowDisplayOptions(): void {
    this.logger.trace('Showing comic display options dialog');
    this.dialog.open(ComicDisplayOptionsComponent, {});
  }

  onSelectLanguage(language: string): void {
    this.logger.debug('Changing selected language:', language);
    this.translateService.use(language);
    if (!!this.user) {
      this.logger.trace('Saving user language preference');
      this.store.dispatch(
        saveUserPreference({ name: LANGUAGE_PREFERENCE, value: language })
      );
    }
  }

  onSetLogging(loggerLevel: LoggerLevel): void {
    this.logger.debug('Setting logger level:', loggerLevel);
    this.logger.level = loggerLevel;
    if (!!this.user) {
      this.logger.trace('Saving user logging preference');
      this.store.dispatch(
        saveUserPreference({
          name: LOGGER_LEVEL_PREFERENCE,
          value: `${loggerLevel}`
        })
      );
    }
  }

  isCurrentLoggingLevel(option: LoggerLevel): boolean {
    return `${option}` === this.logger.level.toString();
  }

  onToggleStacked(): void {
    this.logger.debug('Toggling stacked mode:', !this.stacked);
    this.stacked = !this.stacked;
  }

  onComicViewChange(viewMode: ComicViewMode): void {
    this.logger.debug('Toggling view mode:', viewMode);
    switch (viewMode) {
      case ComicViewMode.ALL:
        this.router.navigate(['/library/comics/all']);
        break;
    }
  }

  onShowBuildDetails(): void {
    this.logger.trace('Showing build details');
    this.router.navigate(['/build']);
  }

  onToggleSidebar(): void {
    this.logger.trace('Toggling sidebar');
    this.toggleSidebar.emit();
  }
}
