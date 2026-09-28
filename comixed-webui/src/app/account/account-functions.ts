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

import { FormGroup } from '@angular/forms';
import { UserRole } from '@app/account/models/user-role';

export function hasRole(roles: UserRole[], target: string): boolean {
  return roles.map(role => role.name).includes(target);
}

export function validatePasswordsMatch(password: string, verify: string) {
  return (form: FormGroup): void => {
    const passwordField = form.controls[password]!;
    const verifyPasswordField = form.controls[verify]!;

    if (
      passwordField.errors &&
      !verifyPasswordField.errors?.['passwordValidation']
    ) {
      return;
    }

    if (passwordField.value !== verifyPasswordField.value) {
      verifyPasswordField.setErrors({ passwordValidation: true });
    } else {
      verifyPasswordField.setErrors(null);
    }
  };
}
