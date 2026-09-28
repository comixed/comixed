/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { login } from '@app/user/actions/authentication.actions';
import { MatIcon } from '@angular/material/icon';
import { selectAuthenticationUserLoaded } from '@app/user/selectors/authentication.selectors';
import { Router } from '@angular/router';

@Component({
  imports: [
    TranslatePipe,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    ReactiveFormsModule,
    MatLabel,
    MatInput,
    MatCardActions,
    MatButton,
    MatIcon
  ],
  selector: 'app-login-page',
  styleUrl: './login-page.scss',
  templateUrl: './login-page.html'
})
export class LoginPage {
  loginForm: FormGroup;
  private logger = inject(LoggerService);
  private formBuilder = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.store.select(selectAuthenticationUserLoaded).subscribe({
      next: loaded => {
        if (loaded) {
          this.logger.info('User already logged in: redirecting browser');
          this.router.navigateByUrl('/');
        } else {
          this.logger.info('User not logged in');
        }
      }
    });
  }

  onSubmitForm() {
    this.logger.debug('Submitting login form');
    const email = this.loginForm.controls['email'].value;
    const password = this.loginForm.controls['password'].value;
    this.store.dispatch(login({ email, password }));
  }
}
