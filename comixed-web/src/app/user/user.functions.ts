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

import { Preference } from '@app/user/models/preference';
import { User } from '@app/user/models/user';
import { ROLE_NAME_ADMIN, ROLE_NAME_READER } from '@app/user/user.constants';

/** Find a specific user preference. */
export function getUserPreference(
  preferences: Preference[],
  name: string,
  defaultValue: string
): string {
  const found = preferences.find(preference => preference.name === name);
  if (!found) {
    return defaultValue;
  }
  return found.value;
}

/** Returns true if the user is a reader. */
export function isReader(user: User): boolean {
  return !!user && user.roles.map(role => role.name).includes(ROLE_NAME_READER);
}

/** Returns true if the user is an admin. */
export function isAdmin(user: User): boolean {
  return !!user && user.roles.map(role => role.name).includes(ROLE_NAME_ADMIN);
}
