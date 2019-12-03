/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role, User } from 'app/user';
import { SaveUserDetails } from 'app/user/models/save-user-details';

@Component({
  selector: 'app-user-details-editor',
  templateUrl: './user-details-editor.component.html',
  styleUrls: ['./user-details-editor.component.scss']
})
export class UserDetailsEditorComponent implements OnInit, OnDestroy {
  private _isAdmin = false;

  @Input() adminEdit = false;
  @Output() save = new EventEmitter<SaveUserDetails>();

  private _user: User;
  userForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.userForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.minLength(8), Validators.maxLength(16)]],
        passwordVerify: [
          '',
          [Validators.minLength(8), Validators.maxLength(16)]
        ],
        isAdmin: [false]
      },
      {
        validator: mustMatch('password', 'passwordVerify')
      }
    );
  }

  ngOnInit() {}

  ngOnDestroy() {}

  @Input()
  set user(user: User) {
    this._user = user;
    this.loadForm();
  }

  @Input()
  set isAdmin(admin: boolean) {
    this._isAdmin = admin;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  @Input()
  set requirePassword(requirePassword: boolean) {
    if (requirePassword) {
      this.userForm.controls['password'].setValidators([
        Validators.required,
        Validators.minLength(8)
      ]);
      this.userForm.controls['passwordVerify'].setValidators([
        Validators.required,
        Validators.minLength(8)
      ]);
    } else {
      this.userForm.controls['password'].setValidators([
        Validators.minLength(8)
      ]);
      this.userForm.controls['passwordVerify'].setValidators([
        Validators.minLength(8)
      ]);
    }
  }

  get user(): User {
    return this._user;
  }

  saveUser(): void {
    this.save.emit({
      id: this._user.id,
      email: this.userForm.controls['email'].value,
      password: this.userForm.controls['password'].value,
      isAdmin: this.userForm.controls['isAdmin'].value
    } as SaveUserDetails);
  }

  resetUser(): void {
    this.loadForm();
  }

  private loadForm() {
    this.userForm.controls['email'].setValue(this._user.email);
    this.userForm.controls['isAdmin'].setValue(this.userIsAdmin());
    this.userForm.controls['password'].setValue('');
    this.userForm.controls['passwordVerify'].setValue('');
    this.userForm.markAsPristine();
  }

  private userIsAdmin(): boolean {
    return (
      this.user.roles.findIndex((role: Role) => role.name === 'ADMIN') !== -1
    );
  }

  adminIsSet(): boolean {
    return this.userForm.controls['isAdmin'].value;
  }
}

export function mustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}
