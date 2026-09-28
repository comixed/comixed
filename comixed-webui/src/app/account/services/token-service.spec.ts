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

import { TestBed } from '@angular/core/testing';
import { beforeEach } from 'vitest';
import { AUTHENTICATION_TOKEN_KEY } from '@app/account/user-constants';
import { TokenService } from '@app/account/services/token-service';

describe('TokenService', () => {
  const TEST_AUTH_TOKEN = 'the authentication token';

  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setting the authentication token', () => {
    beforeEach(() => {
      window.localStorage.removeItem(AUTHENTICATION_TOKEN_KEY);
      service.setAuthToken(TEST_AUTH_TOKEN);
    });

    it('stores the token', () => {
      expect(window.localStorage.getItem(AUTHENTICATION_TOKEN_KEY)).toEqual(
        TEST_AUTH_TOKEN
      );
    });
  });

  describe('checking if an authentication token exists', () => {
    describe('when one is present', () => {
      beforeEach(() => {
        window.localStorage.setItem(AUTHENTICATION_TOKEN_KEY, TEST_AUTH_TOKEN);
      });

      it('returns true', () => {
        expect(service.hasAuthToken()).toBeTruthy();
      });
    });

    describe('when one is not present', () => {
      beforeEach(() => {
        window.localStorage.removeItem(AUTHENTICATION_TOKEN_KEY);
      });

      it('returns false', () => {
        expect(service.hasAuthToken()).toBeFalsy();
      });
    });
  });

  describe('getting the authentication token', () => {
    beforeEach(() => {
      window.localStorage.setItem(AUTHENTICATION_TOKEN_KEY, TEST_AUTH_TOKEN);
    });

    it('returns the token', () => {
      expect(service.getAuthToken()).toEqual(TEST_AUTH_TOKEN);
    });
  });

  describe('clearing the authentication token', () => {
    beforeEach(() => {
      window.localStorage.setItem(AUTHENTICATION_TOKEN_KEY, TEST_AUTH_TOKEN);
      service.clearAuthToken();
    });

    it('stores the token', () => {
      expect(service.getAuthToken()).toEqual('');
    });
  });
});
