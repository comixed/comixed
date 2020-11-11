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

import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { LoggerModule } from '@angular-ru/logger';
import { AUTHENTICATION_TOKEN } from '@app/core/core.fixtures';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LoggerModule.forRoot()] });
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setting the authentication token', () => {
    beforeEach(() => {
      service.setAuthToken(AUTHENTICATION_TOKEN);
    });

    it('returns that it has an authentication token', () => {
      expect(service.hasAuthToken()).toBeTruthy();
    });

    it('returns the authentication token', () => {
      expect(service.getAuthToken()).toEqual(AUTHENTICATION_TOKEN);
    });
  });

  describe('clearing the authentication token', () => {
    beforeEach(() => {
      service.setAuthToken(AUTHENTICATION_TOKEN);
      service.clearAuthToken();
    });

    it('returns that it does not have an authentication token', () => {
      expect(service.hasAuthToken()).toBeFalsy();
    });

    it('deletes the stored token', () => {
      expect(service.getAuthToken()).toBeNull();
    });
  });
});
