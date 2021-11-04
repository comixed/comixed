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

import { Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';

const AUTH_TOKEN_KEY = 'comixed.auth-token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private logger: LoggerService) {}

  /** Stores an authentication token. */
  setAuthToken(token: string): void {
    this.logger.trace('Storing authenticatione token');
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  /** Returns if there is an authentication token. */
  hasAuthToken(): boolean {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token && token.length > 0;
  }

  /** Retrieves the authentication token. */
  getAuthToken(): string {
    this.logger.trace('Retrieving authenticatione token');
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /** Clears the authentication token. */
  clearAuthToken(): void {
    this.logger.trace('Clearing authenticatione token');
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}
