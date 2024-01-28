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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { TitleService } from '@app/core/services/title.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { selectInitialUserAccountState } from '@app/user/selectors/initial-user-account.selectors';
import {
  createAdminAccount,
  loadInitialUserAccount
} from '@app/user/actions/initial-user-account.actions';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@app/user/user.constants';
import { passwordVerifyValidator } from '@app/user/user.functions';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cx-create-admin-page',
  templateUrl: './create-admin-page.component.html',
  styleUrls: ['./create-admin-page.component.scss']
})
export class CreateAdminPageComponent implements OnInit, OnDestroy {
  initialUserSubscription: Subscription;
  changeLangSubscription: Subscription;

  createAdminForm: FormGroup;

  constructor(
    private logger: LoggerService,
    private store: Store,
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.logger.trace('Creating admin form');
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

    this.logger.trace('Subscribing to initial user state updates');
    this.initialUserSubscription = this.store
      .select(selectInitialUserAccountState)
      .pipe(filter(state => !!state && !state.busy))
      .subscribe(state => {
        if (state.hasExisting) {
          this.logger.trace('Has users: redirecting to root page');
          this.router.navigateByUrl('/');
        }
      });
    this.logger.trace('Subscribing to language change updates');
    this.changeLangSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.createAdminForm.controls;
  }

  ngOnDestroy(): void {
    this.logger.debug('Loading initial user accounts');
    this.store.dispatch(loadInitialUserAccount());
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.logger.trace('Unsubscribing to initial user state updates');
    this.initialUserSubscription.unsubscribe();
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
