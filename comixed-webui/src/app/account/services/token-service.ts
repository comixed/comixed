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

import { Service } from '@angular/core';
import { AUTHENTICATION_TOKEN_KEY } from '@app/account/user-constants';

@Service()
export class TokenService {
  setAuthToken(token: string) {
    window.localStorage.setItem(AUTHENTICATION_TOKEN_KEY, token);
  }

  hasAuthToken(): boolean {
    return !!window.localStorage.getItem(AUTHENTICATION_TOKEN_KEY);
  }

  getAuthToken(): string {
    return window.localStorage.getItem(AUTHENTICATION_TOKEN_KEY) || '';
  }

  clearAuthToken() {
    window.localStorage.removeItem(AUTHENTICATION_TOKEN_KEY);
  }
}
