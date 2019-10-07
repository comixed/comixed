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

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationAdaptor } from 'app/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() show_login_dialog: boolean;
  login_form: FormGroup;
  email: string;
  password: string;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private form_builder: FormBuilder,
    private auth_adaptor: AuthenticationAdaptor
  ) {
    this.login_form = form_builder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)])
      ]
    });
  }

  ngOnInit() {}

  do_login(): void {
    this.auth_adaptor.sendLoginData(this.email, this.password);
  }

  cancel_login(): void {
    this.auth_adaptor.cancelLogin();
  }
}
