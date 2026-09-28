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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Router } from '@angular/router';
import { AccountService } from '@app/account/services/account-service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { validatePasswordsMatch } from '@app/account/account-functions';
import { Store } from '@ngrx/store';
import { selectExistingAdminAccountExists } from '@app/account/selectors/existing-admin-account.selectors';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@openng/optimus-ui/card';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { IftaLabel } from '@openng/optimus-ui/iftalabel';
import { ExistingAdminAccountActions } from '@app/account/actions/existing-admin-account.actions';

@Component({
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    Card,
    Button,
    InputText,
    IftaLabel
  ],
  selector: 'app-initial-account-page',
  styleUrl: './initial-account-page.scss',
  templateUrl: './initial-account-page.html'
})
export class InitialAccountPage {
  readonly logger = inject(LoggerService);
  readonly store = inject(Store);
  readonly router = inject(Router);
  readonly accountService = inject(AccountService);
  readonly formBuilder = inject(FormBuilder);

  initialAdminForm!: FormGroup;

  constructor() {
    this.store.select(selectExistingAdminAccountExists).subscribe({
      next: exists => {
        if (exists) {
          this.logger.trace('Account already exists');
          this.router.navigateByUrl('/');
        }
      }
    });
    this.initialAdminForm = this.formBuilder.group(
      {
        email: new FormControl('', [Validators.email, Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(16)
        ]),
        verifyPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(16)
        ])
      },
      { validator: validatePasswordsMatch('password', 'verifyPassword') }
    );
    this.logger.trace('Checking for existing accounts');
    this.accountService.checkForAdminAccount();
  }

  get verifyPassword() {
    return this.initialAdminForm.get('verifyPassword');
  }

  onSubmitForm(): void {
    this.logger.trace('Sending initial admin account details');
    const email = this.initialAdminForm.controls['email'].value;
    const password = this.initialAdminForm.controls['password'].value;
    this.store.dispatch(
      ExistingAdminAccountActions.create({ email, password })
    );
  }
}
