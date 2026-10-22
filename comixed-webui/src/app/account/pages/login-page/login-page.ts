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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Router } from '@angular/router';
import { TitleService } from '@app/layout/services/title-service';
import { Card } from '@openng/optimus-ui/card';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { IftaLabel } from '@openng/optimus-ui/iftalabel';
import { Store } from '@ngrx/store';
import { selectCurrentUserAuthenticated } from '@app/account/selectors/current-user.selectors';
import { CurrentUserActions } from '@app/account/actions/current-user.actions';

@Component({
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    Card,
    Button,
    InputText,
    IftaLabel
  ],
  selector: 'app-login-page',
  styleUrl: './login-page.scss',
  templateUrl: './login-page.html'
})
export class LoginPage {
  loginForm!: FormGroup;
  readonly logger = inject(LoggerService);
  readonly formBuilder = inject(FormBuilder);
  readonly store = inject(Store);
  readonly router = inject(Router);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.store.select(selectCurrentUserAuthenticated).subscribe({
      next: authenticated => {
        if (authenticated) {
          this.logger.trace(
            'User already authenticated: redirecting to root page'
          );
          this.router.navigateByUrl('/');
        }
      }
    });
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
  }

  onSubmitForm() {
    this.logger.debug('Submitting login form');
    const email = this.loginForm.controls['email'].value;
    const password = this.loginForm.controls['password'].value;
    this.store.dispatch(CurrentUserActions.login({ email, password }));
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('login-page.page-title')
    );
  }
}
