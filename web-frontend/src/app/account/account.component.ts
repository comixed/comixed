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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../models/user/user';
import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {
  user$: Observable<User>;
  user_subscription: Subscription;
  user: User;

  email: string;
  password = '';
  password_check = '';
  password_error = '';

  constructor(
    private store: Store<AppState>,
    private user_service: UserService,
    private alert_service: AlertService,
  ) {
    this.user$ = this.store.select('user');
  }

  ngOnInit() {
    this.user_subscription = this.user$.subscribe(
      (user: User) => {
        this.user = user;

        this.email = this.user.email;
      });
  }

  ngOnDestroy() {
    this.user_subscription.unsubscribe();
  }

  passesPasswordValidation(): boolean {
    if ((this.password.length > 8) && (this.password === this.password_check)) {
      this.password_error = '';
      return true;
    } else {
      this.password_error = 'Passwords do not match.';
      return false;
    }
  }

  updateUsername(): void {
  }

  updatePassword(): void {
  }
}
