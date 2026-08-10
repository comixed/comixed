/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {
  selectCheckedForExistingAccount,
  selectHasExistingAccounts
} from '@app/user/selectors/initial-user-account.selectors';
import {
  createAdminAccount,
  loadInitialUserAccount
} from '@app/user/actions/initial-user-account.actions';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@app/user/user.constants';
import { passwordVerifyValidator } from '@app/user/user.functions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { tap } from 'rxjs';

@Component({
  selector: 'cx-create-admin-page',
  templateUrl: './create-admin-page.component.html',
  styleUrls: ['./create-admin-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatError,
    MatButton,
    MatLabel,
    MatIcon,
    TranslateModule
  ]
})
export class CreateAdminPageComponent implements OnInit {
  createAdminForm: FormGroup;

  logger = inject(LoggerService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);
  titleService = inject(TitleService);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);
  router = inject(Router);

  constructor() {
    this.createAdminForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(MIN_PASSWORD_LENGTH),
            Validators.maxLength(MAX_PASSWORD_LENGTH)
          ]
        ],
        passwordVerify: ['', [Validators.required]]
      },
      { validators: passwordVerifyValidator }
    );
    this.store
      .select(selectCheckedForExistingAccount)
      .pipe(
        tap(checked => {
          console.log('*** checked:', checked);
          if (!checked) {
            this.logger.debug('Loading initial user accounts');
            this.store.dispatch(loadInitialUserAccount());
          }
        })
      )
      .subscribe();
    this.store
      .select(selectHasExistingAccounts)
      .pipe(
        tap(hasAccounts => {
          if (hasAccounts) {
            this.logger.trace('Has accounts: redirecting to root page');
            this.router.navigateByUrl('/login');
          }
        })
      )
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.createAdminForm.controls;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onCreateAccount(): void {
    const email = this.createAdminForm.controls.email.value;
    const password = this.createAdminForm.controls.password.value;

    this.confirmationService.confirm({
      title: this.translateService.instant(
        'create-admin-account.text.confirmation-title'
      ),
      message: this.translateService.instant(
        'create-admin-account.text.confirmation-message',
        { email }
      ),
      confirm: () => {
        this.logger.info('Creating admin account:', email);
        this.store.dispatch(createAdminAccount({ email, password }));
      }
    });
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('create-admin-page.tab-title')
    );
  }
}
