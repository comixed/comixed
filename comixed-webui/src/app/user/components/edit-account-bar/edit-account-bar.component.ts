/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { User } from '@app/user/models/user';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ConfirmationService } from '@tragically-slick/confirmation';
import { selectUserState } from '@app/user/selectors/user.selectors';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH
} from '@app/user/user.constants';
import {
  saveCurrentUser,
  saveUserPreference
} from '@app/user/actions/user.actions';
import { TranslateService } from '@ngx-translate/core';
import { passwordVerifyValidator } from '@app/user/user.functions';
import { MatTableDataSource } from '@angular/material/table';
import { Preference } from '@app/user/models/preference';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'cx-edit-account-bar',
  templateUrl: './edit-account-bar.component.html',
  styleUrls: ['./edit-account-bar.component.scss']
})
export class EditAccountBarComponent implements OnDestroy, AfterViewInit {
  @ViewChild('avatarContainer') container: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  @Output() closeSidebar = new EventEmitter<void>();
  userForm: FormGroup;
  userStateSubscription: Subscription;
  userSubscription: Subscription;
  avatarWidth$ = new BehaviorSubject<number>(40);
  busy = false;

  readonly displayedColumns = ['name', 'value', 'actions'];
  dataSource = new MatTableDataSource<Preference>([]);

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      passwordVerify: ['']
    });
    this.userStateSubscription = this.store
      .select(selectUserState)
      .subscribe(state => {
        this.logger.debug(`Setting busy state to ${state.saving}`);
        this.busy = state.saving;
      });
  }

  private _user: User = null;

  get user(): User {
    return this._user;
  }

  @Input() set user(user: User) {
    this._user = user;
    if (!!user) {
      this.userForm.controls.email.setValue(user.email);
      this.userForm.controls.password.setValue('');
      this.userForm.controls.passwordVerify.setValue('');
      this.onPasswordChanged();
      this.dataSource.data = user.preferences;
    } else {
      this.dataSource.data = [];
    }
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.userForm.controls;
  }

  ngOnDestroy(): void {
    this.userStateSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.logger.trace('Assigning table sort');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'name':
          return data.name;
        case 'value':
          return data.value;
      }
    };
    this.loadComponentDimensions();
  }

  @HostListener('window:resize', ['$event']) onWindowResized(event: any): void {
    this.loadComponentDimensions();
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
        this.resetUser();
      }
    });
  }

  onCloseForm(): void {
    this.resetUser();
    this.logger.trace('Closing edit account sidebar');
    this.closeSidebar.emit();
  }

  onDeletePreference(name: string): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'user.user-preferences.delete-confirmation-title'
      ),
      message: this.translateService.instant(
        'user.user-preferences.delete-confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Deleting user preference:', name);
        this.store.dispatch(saveUserPreference({ name, value: null }));
      }
    });
  }

  private resetUser(): void {
    this.logger.debug('Resetting user account changes');
    this.user = this._user;
  }

  private loadComponentDimensions(): void {
    /* istanbul ignore next */
    const width = this.container?.nativeElement?.offsetWidth || 40;
    /* istanbul ignore next */
    this.avatarWidth$.next(!!width || width > 100 ? 100 : width);
  }
}
