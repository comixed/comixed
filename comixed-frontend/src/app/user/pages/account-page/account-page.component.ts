/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { AuthenticationAdaptor, User } from 'app/user';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { SaveUserDetails } from 'app/user/models/save-user-details';
import { ConfirmationService } from 'primeng/api';
import { UserAdminAdaptor } from 'app/user/adaptors/user-admin.adaptor';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit, OnDestroy {
  authStateSubscription: Subscription;
  user: User;
  langChangeSubscription: Subscription;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private userAdminAdaptor: UserAdminAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {}

  ngOnInit() {
    this.authStateSubscription = this.authenticationAdaptor.user$
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.user = user;
        this.titleService.setTitle(
          this.translateService.instant('account-page.title', {
            email: this.user.email
          })
        );
      });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.account-page') }
    ]);
  }

  saveUser(details: SaveUserDetails): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('account-page.save-user.header'),
      message: this.translateService.instant('account-page.save-user.message'),
      accept: () => this.userAdminAdaptor.saveUser(details)
    });
  }
}
