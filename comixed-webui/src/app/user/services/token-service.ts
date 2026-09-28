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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AUTHENTICATION_TOKEN_KEY } from '@app/user/user-constants';

@Service()
export class TokenService {
  logger = inject(LoggerService);

  setAuthToken(token: string) {
    this.logger.trace('Saving authentication token');
    window.localStorage.setItem(AUTHENTICATION_TOKEN_KEY, token);
  }

  getAuthToken(): string {
    this.logger.trace('Retrieving authentication token');
    return window.localStorage.getItem(AUTHENTICATION_TOKEN_KEY) || '';
  }

  clearAuthToken() {
    this.logger.trace('Clearing authentication token');
    window.localStorage.removeItem(AUTHENTICATION_TOKEN_KEY);
  }
}
