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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as UserAdminActions from 'app/actions/user-admin.actions';
import { Observable, Subscription } from 'rxjs';
import { UserAdmin } from 'app/models/actions/user-admin';
import { ConfirmationService } from 'primeng/api';
import { AuthenticationAdaptor, User } from 'app/user';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit, OnDestroy {
  private langChangeSubscription: Subscription;
  private adminSubscription: Subscription;
  isAdmin = false;

  private user_admin$: Observable<UserAdmin>;
  private user_admin_subscription: Subscription;
  public user_admin: UserAdmin;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private store: Store<AppState>,
    private confirmationService: ConfirmationService,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private authenticationAdaptor: AuthenticationAdaptor
  ) {
    this.user_admin$ = store.select('user_admin');
  }

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.titleService.setTitle(
      this.translateService.instant('users-page.title')
    );
    this.user_admin_subscription = this.user_admin$.subscribe(
      (user_admin: UserAdmin) => {
        this.user_admin = user_admin;
      }
    );
    this.store.dispatch(new UserAdminActions.UserAdminListUsers());
    this.adminSubscription = this.authenticationAdaptor.role$.subscribe(
      roles => (this.isAdmin = roles.is_admin)
    );
  }

  ngOnDestroy() {
    this.user_admin_subscription.unsubscribe();
    this.adminSubscription.unsubscribe();
  }

  setCurrentUser(user: User): void {
    if (!!user) {
      this.store.dispatch(
        new UserAdminActions.UserAdminEditUser({ user: user })
      );
    } else {
      this.store.dispatch(new UserAdminActions.UserAdminClearEdit());
    }
  }

  setNewUser(): void {
    this.store.dispatch(new UserAdminActions.UserAdminCreateUser());
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      header: `Delete ${user.email}?`,
      message: 'Are you sure you want to delete this user account?',
      icon: 'fa fa-exclamation',
      accept: () => {
        this.store.dispatch(
          new UserAdminActions.UserAdminDeleteUser({ user: user })
        );
      }
    });
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.admin.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.users-admin'
        )
      }
    ]);
  }
}
