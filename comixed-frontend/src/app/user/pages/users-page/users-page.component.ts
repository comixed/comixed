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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthenticationAdaptor, UserModuleState, User } from 'app/user';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { UserAdminAdaptor } from 'app/user/adaptors/user-admin.adaptor';
import { SaveUserDetails } from 'app/user/models/save-user-details';
import { Store } from '@ngrx/store';
import { setBreadcrumbs } from 'app/actions/breadcrumb.actions';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  adminSubscription: Subscription;
  isAdmin = false;
  loggedInUserSubscription: Subscription;
  loggedInUser: User;
  fetchingSubscription: Subscription;
  fetching = false;
  usersSubscription: Subscription;
  users: User[];
  currentSubscription: Subscription;
  current = null;

  constructor(
    private store: Store<UserModuleState>,
    private titleService: Title,
    private messageService: MessageService,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private userAdminAdaptor: UserAdminAdaptor
  ) {}

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.titleService.setTitle(
      this.translateService.instant('users-page.title')
    );
    this.adminSubscription = this.authenticationAdaptor.role$.subscribe(
      roles => (this.isAdmin = roles.admin)
    );
    this.loggedInUserSubscription = this.authenticationAdaptor.user$.subscribe(
      user => (this.loggedInUser = user)
    );
    this.fetchingSubscription = this.userAdminAdaptor.fetchingUser$.subscribe(
      fetching => (this.fetching = fetching)
    );
    this.usersSubscription = this.userAdminAdaptor.allUser$.subscribe(
      users => (this.users = users)
    );
    this.userAdminAdaptor.getAllUsers();
    this.currentSubscription = this.userAdminAdaptor.current$.subscribe(
      current => (this.current = current)
    );
  }

  ngOnDestroy() {
    this.adminSubscription.unsubscribe();
    this.loggedInUserSubscription.unsubscribe();
    this.fetchingSubscription.unsubscribe();
    this.usersSubscription.unsubscribe();
    this.currentSubscription.unsubscribe();
  }

  setCurrentUser(user: User): void {
    if (!!user) {
      this.userAdminAdaptor.setCurrent(user);
    } else {
      this.userAdminAdaptor.clearCurrent();
    }
  }

  setNewUser(): void {
    this.userAdminAdaptor.createNewUser();
  }

  deleteUser(user: User): void {
    if (user.id === this.loggedInUser.id) {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'users-page.text.cant-delete-yourself'
        )
      });
    } else {
      this.confirmationService.confirm({
        header: `Delete ${user.email}?`,
        message: 'Are you sure you want to delete this user account?',
        icon: 'fa fa-exclamation',
        accept: () => this.userAdminAdaptor.deleteUser(user)
      });
    }
  }

  private loadTranslations() {
    this.store.dispatch(
      setBreadcrumbs({
        entries: [
          {
            label: this.translateService.instant('breadcrumb.entry.admin.root')
          },
          {
            label: this.translateService.instant(
              'breadcrumb.entry.admin.users-admin'
            )
          }
        ]
      })
    );
  }

  saveUser(details: SaveUserDetails): void {
    this.userAdminAdaptor.saveUser(details);
  }
}
