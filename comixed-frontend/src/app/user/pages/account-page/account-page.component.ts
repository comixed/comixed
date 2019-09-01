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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationAdaptor } from 'app/user';
import { AuthenticationState } from 'app/user/models/authentication-state';
import { User } from 'app/user';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css']
})
export class AccountPageComponent implements OnInit, OnDestroy {
  auth_state_subscription: Subscription;
  user: User;

  constructor(
    private title_service: Title,
    private translate_service: TranslateService,
    private auth_adaptor: AuthenticationAdaptor
  ) {}

  ngOnInit() {
    this.auth_state_subscription = this.auth_adaptor.user$
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.user = user;
        this.title_service.setTitle(
          this.translate_service.instant('account-page.title', {
            email: this.user.email
          })
        );
      });
  }

  ngOnDestroy() {
    this.auth_state_subscription.unsubscribe();
  }
}
