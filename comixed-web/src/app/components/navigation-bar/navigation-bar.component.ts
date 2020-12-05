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

import { Component, Input } from '@angular/core';
import { User } from '@app/user/models/user';
import { LoggerService } from '@angular-ru/logger';
import { Router } from '@angular/router';
import { ConfirmationService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { logoutUser } from '@app/user/actions/user.actions';
import { Store } from '@ngrx/store';
import { isAdmin } from '@app/user/user.functions';

@Component({
  selector: 'cx-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  private _user: User;

  isAdmin = false;

  constructor(
    private logger: LoggerService,
    private router: Router,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {}

  @Input()
  set user(user: User) {
    this._user = user;
    this.isAdmin = isAdmin(user);
  }

  get user(): User {
    return this._user;
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
}
