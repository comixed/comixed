/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { User } from '@app/user/models/user';
import {
  selectUser,
  selectUserState
} from '@app/user/selectors/user.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { TranslateService } from '@ngx-translate/core';
import { saveCurrentUser } from '@app/user/actions/user.actions';
import { TitleService } from '@app/core/services/title.service';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { getUserPreference } from '@app/user';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@app/user/user.constants';

@Component({
  selector: 'cx-account-edit',
  templateUrl: './account-edit-page.component.html',
  styleUrls: ['./account-edit-page.component.scss']
})
export class AccountEditPageComponent implements OnDestroy {
  userForm: FormGroup;
  userStateSubscripton: Subscription;
  userSubscription: Subscription;
  langChangeSubscription: Subscription;
  imageSize = PAGE_SIZE_DEFAULT;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      passwordVerify: ['']
    });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.userStateSubscripton = this.store
      .select(selectUserState)
      .subscribe(state => {
        this.store.dispatch(
          setBusyState({ enabled: state.loading || state.saving })
        );
      });
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => (this.user = user));
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.userForm.controls;
  }

  private _user: User;

  get user(): User {
    return this._user;
  }

  set user(user: User) {
    this._user = user;
    this.userForm.controls.email.setValue(user.email);
    this.userForm.controls.password.setValue('');
    this.userForm.controls.passwordVerify.setValue('');
    this.onPasswordChanged();
    this.loadTranslations();
    this.imageSize = parseInt(
      getUserPreference(
        user.preferences,
        PAGE_SIZE_PREFERENCE,
        `${this.imageSize}`
      ),
      10
    );
  }

  ngOnDestroy(): void {
    this.userStateSubscripton.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  onPasswordChanged(): void {
    this.logger.trace('Password value has changed');
    const password = this.userForm.controls.password.value;
    if (!!password && password !== '') {
      this.logger.trace('Adding validators to password');
      this.userForm.controls.password.setValidators([
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        Validators.maxLength(MAX_PASSWORD_LENGTH)
      ]);
      this.logger.trace('Adding validators to password verify');
      this.userForm.controls.passwordVerify.setValidators([
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        Validators.maxLength(MAX_PASSWORD_LENGTH)
      ]);
      this.logger.trace('Adding password comparison validator');
      this.userForm.setValidators(passwordVerifyValidator);
    } else {
      this.logger.trace('Removing password validators');
      this.userForm.controls.password.setValidators(null);
      this.logger.trace('Removing password verify validators');
      this.userForm.controls.passwordVerify.setValidators(null);
      this.logger.trace('Removing password comparison validator');
      this.userForm.setValidators(null);
    }
    this.userForm.controls.password.updateValueAndValidity();
    this.userForm.controls.passwordVerify.updateValueAndValidity();
    this.userForm.updateValueAndValidity();
  }

  onSaveChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'user.save-current-user.confirmation-title'
      ),
      message: this.translateService.instant(
        'user.save-current-user.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Saving user account changes');
        this.store.dispatch(
          saveCurrentUser({
            user: { ...this.user, email: this.userForm.controls.email.value },
            password: this.userForm.controls.password.value
          })
        );
      }
    });
  }

  onResetChanges(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'user.reset-user-changes.confirmation-title'
      ),
      message: this.translateService.instant(
        'user.reset-user-changes.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Resetting user account changes');
        this.user = this._user;
      }
    });
  }

  private loadTranslations(): void {
    this.titleService.setTitle(
      this.translateService.instant('user.edit-current-user.tab-title', {
        email: this.user?.email
      })
    );
  }
}

export const passwordVerifyValidator: ValidatorFn = (
  formGroup: FormGroup
): ValidationErrors | null => {
  const password = formGroup.controls.password.value;
  const passwordVerify = formGroup.controls.passwordVerify.value;
  return (!password && !passwordVerify) || password === passwordVerify
    ? null
    : { passwordsDontMatch: true };
};
