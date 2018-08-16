/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

export class Role {
  name: string;

  constructor(
    name: string,
  ) {
    this.name = name;
  }
}

export class Preference {
  name: string;
  value: string;

  constructor(
    name: string,
    value: string,
  ) {
    this.name = name;
    this.value = value;
  }
}

export class User {
  name: string;
  authenticated = true;
  first_login_date: number;
  last_login_date: number;
  roles: Role[];
  preferences: Preference[];

  constructor(
    name?: string,
    first_login_date?: number,
    last_login_date?: number,
    roles?: Role[],
    preferences?: Preference[],
  ) {
    this.name = name;
    this.first_login_date = first_login_date;
    this.last_login_date = last_login_date;
    this.roles = roles;
    this.preferences = preferences;
  }
}
