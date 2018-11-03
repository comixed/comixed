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

import { Component, OnInit } from '@angular/core';

import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  username;
  password = '';
  password_check = '';
  password_error = '';

  constructor(
    private user_service: UserService,
    private alert_service: AlertService,
  ) { }

  ngOnInit() {
    this.username = this.user_service.get_user().name;
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
    this.user_service.change_username(this.username).subscribe(
      (response: Response) => {
        this.password_error = '';
        this.alert_service.show_info_message(`Your username has been updated to ${this.username}...`);
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to update your username...', error);
      }
    );
  }

  updatePassword(): void {
    this.user_service.change_password(this.password).subscribe(
      (response: Response) => {
        this.password_error = '';
        this.alert_service.show_info_message('Your password has been updated...');
      },
      (error: Error) => {
        this.alert_service.show_error_message('Unable to update your password...', error);
      }
    );
  }
}
