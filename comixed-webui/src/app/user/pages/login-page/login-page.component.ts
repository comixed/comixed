/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  AbstractControl,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  selectUserAuthenticated,
  selectUserAuthenticating
} from '@app/user/selectors/user.selectors';
import { loginUser } from '@app/user/actions/user.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TitleService } from '@app/core/services/title.service';
import { setBusyState } from '@app/core/actions/busy.actions';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@app/user/user.constants';
import {
  selectCreateInitialUserAccount,
  selectHasExistingAccounts
} from '@app/user/selectors/initial-user-account.selectors';
import { loadInitialUserAccount } from '@app/user/actions/initial-user-account.actions';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { filter, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatInput,
    MatError,
    MatButton,
    MatLabel,
    MatIcon,
    TranslateModule,
    AsyncPipe
  ]
})
export class LoginPageComponent implements OnInit, AfterViewInit {
  loginForm: UntypedFormGroup;
  busy$ = new BehaviorSubject(false);

  logger = inject(LoggerService);
  formBuilder = inject(UntypedFormBuilder);
  store = inject(Store);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  router = inject(Router);

  constructor() {
    this.logger.trace('Creating the login form');
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(MIN_PASSWORD_LENGTH),
          Validators.maxLength(MAX_PASSWORD_LENGTH)
        ]
      ]
    });
    this.store
      .select(selectHasExistingAccounts)
      .pipe(
        filter(flag => flag),
        tap(() => {
          this.logger.info('Loading initial user accounts');
          this.store.dispatch(loadInitialUserAccount());
        })
      )
      .subscribe();
    this.store
      .select(selectCreateInitialUserAccount)
      .pipe(
        filter(flag => flag),
        tap(() => {
          this.logger.trace('Redirecting to account creation page');
          this.router.navigateByUrl('/users/create/admin');
        })
      )
      .subscribe();
    this.store
      .select(selectUserAuthenticated)
      .pipe(
        filter(flag => flag),
        tap(() => {
          this.logger.info('Already authenticated: redirecting to home');
          this.router.navigateByUrl('/');
        })
      )
      .subscribe();
    this.store
      .select(selectUserAuthenticating)
      .pipe(tap(busy => this.busy$.next(busy)))
      .subscribe();
    this.translateService.onLangChange
      .pipe(tap(() => this.loadTranslations()))
      .subscribe();
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  ngAfterViewInit(): void {
    this.logger.trace('Clear busy mode');
    this.store.dispatch(setBusyState({ enabled: false }));
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.logger.trace('Checking for existing accounts');
    this.store.dispatch(loadInitialUserAccount());
  }

  onSubmitLogin(): void {
    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;
    this.logger.trace('Attempting to login user:', email);
    this.store.dispatch(loginUser({ email, password }));
  }

  loadTranslations(): void {
    this.titleService.setTitle(this.translateService.instant('login.title'));
  }
}
