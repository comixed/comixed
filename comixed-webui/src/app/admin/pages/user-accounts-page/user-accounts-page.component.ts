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

import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TitleService } from '@app/core/services/title.service';
import { Store } from '@ngrx/store';
import {
  selectManageUsersCurrent,
  selectManageUsersList,
  selectManageUsersState
} from '@app/user/selectors/manage-users.selectors';
import { setBusyState } from '@app/core/actions/busy.actions';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '@app/user/models/user';
import { MatSort } from '@angular/material/sort';
import {
  deleteUserAccount,
  loadUserAccountList,
  saveUserAccount,
  setCurrentUser
} from '@app/user/actions/manage-users.actions';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
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
import {
  isAdmin,
  isReader,
  passwordVerifyValidator
} from '@app/user/user.functions';
import { ConfirmationService } from '@tragically-slick/confirmation';

@Component({
  selector: 'cx-user-accounts-page',
  templateUrl: './user-accounts-page.component.html',
  styleUrl: './user-accounts-page.component.scss'
})
export class UserAccountsPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource<User>([]);

  langChangeSubscription: Subscription;
  manageUsersStateSubscription: Subscription;
  userListSubscription: Subscription;
  userSubscription: Subscription;
  showUserForm = false;
  editUserForm: FormGroup;

  readonly displayedColumns = [
    'email',
    'roles',
    'first-login-date',
    'last-login-date'
  ];

  constructor(
    private logger: LoggerService,
    private store: Store,
    private translateService: TranslateService,
    private titleService: TitleService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    public queryParameterService: QueryParameterService
  ) {
    this.logger.trace('Subscribing to language change updates');
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.logger.trace('Subscribing to manage user state updates');
    this.manageUsersStateSubscription = this.store
      .select(selectManageUsersState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
      });
    this.logger.trace('Subscribing to user list updates');
    this.userListSubscription = this.store
      .select(selectManageUsersList)
      .subscribe(users => (this.users = users));
    this.logger.trace('Subscribing to current user updates');
    this.userSubscription = this.store
      .select(selectManageUsersCurrent)
      .subscribe(user => (this.user = user));
    this.logger.trace('Creating the user form');
    this.editUserForm = this.formBuilder.group(
      {
        id: [],
        email: ['', [Validators.email, Validators.required]],
        admin: [''],
        password: [''],
        passwordVerify: ['']
      },
      { validators: passwordVerifyValidator }
    );
  }

  get users(): User[] {
    return this.dataSource.data;
  }

  set users(users: User[]) {
    this.dataSource.data = users;
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.editUserForm.controls;
  }

  private _user: User | null = null;

  get user(): User | null {
    return this._user;
  }

  set user(user: User | null) {
    if (!!user) {
      this.editUserForm.controls.id.setValue(user.id);
      this.editUserForm.controls.email.setValue(user.email);
      this.editUserForm.controls.admin.setValue(isAdmin(user));
    } else {
      this.editUserForm.controls.id.setValue(null);
      this.editUserForm.controls.email.setValue('');
      this.editUserForm.controls.admin.setValue(false);
    }
    this.editUserForm.controls.password.setValue('');
    this.editUserForm.controls.passwordVerify.setValue('');
    this._user = user;
    this.onPasswordChanged();
  }

  isAdmin(user: User): boolean {
    return isAdmin(user);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.store.dispatch(loadUserAccountList());
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  onShowUserForm(user: User | null): void {
    this.logger.trace('Showing user form for user:', user);
    this.store.dispatch(setCurrentUser({ user }));
    this.showUserForm = true;
  }

  onSaveAccount(): void {
    const id = this.editUserForm.controls.id.value;
    const email = this.editUserForm.controls.email.value;
    const password = this.editUserForm.controls.password.value;
    const admin = this.editUserForm.controls.admin.value;
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'user-accounts.save-user-account.confirmation-title'
      ),
      message: this.translateService.instant(
        'user-accounts.save-user-account.confirmation-message',
        { email }
      ),
      confirm: () => {
        this.logger.debug('Saving user account:', email, password, admin);
        this.store.dispatch(saveUserAccount({ id, email, password, admin }));
        this.showUserForm = false;
      }
    });
  }

  isReader(user: User): boolean {
    return isReader(user);
  }

  onDeleteUser(): void {
    const email = this.user?.email;
    const id = this.user?.id;
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'user-accounts.delete-user-account.confirmation-title'
      ),
      message: this.translateService.instant(
        'user-accounts.delete-user-account.confirmation-message',
        { email }
      ),
      confirm: () => {
        this.logger.debug('Deleting user account:', email, id);
        this.store.dispatch(deleteUserAccount({ id, email }));
        this.showUserForm = false;
      }
    });
  }

  onPasswordChanged(): void {
    this.logger.trace('Password value has changed');
    const password = this.editUserForm.controls.password.value;
    if (!!password && password !== '') {
      this.logger.trace('Adding validators to password');
      this.editUserForm.controls.password.setValidators([
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        Validators.maxLength(MAX_PASSWORD_LENGTH)
      ]);
      this.logger.trace('Adding validators to password verify');
      this.editUserForm.controls.passwordVerify.setValidators([
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        Validators.maxLength(MAX_PASSWORD_LENGTH)
      ]);
      this.logger.trace('Adding password comparison validator');
      this.editUserForm.setValidators(passwordVerifyValidator);
    } else {
      this.logger.trace('Removing password validators');
      this.editUserForm.controls.password.setValidators(null);
      this.logger.trace('Removing password verify validators');
      this.editUserForm.controls.passwordVerify.setValidators(null);
      this.logger.trace('Removing password comparison validator');
      this.editUserForm.setValidators(null);
    }
    this.editUserForm.controls.password.updateValueAndValidity();
    this.editUserForm.controls.passwordVerify.updateValueAndValidity();
    this.editUserForm.updateValueAndValidity();
  }

  private loadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('user-accounts.tab-title')
    );
  }
}
