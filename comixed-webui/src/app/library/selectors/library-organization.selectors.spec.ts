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

import {
  initialLibraryOrganizationState,
  LIBRARY_ORGANIZATION_FEATURE_KEY,
  LibraryOrganizationState
} from '../reducers/library-organization.reducer';
import { selectLibraryOrganizationBusy } from '@app/library/selectors/library-organization.selectors';
import { beforeEach } from 'vitest';

describe('OrganizingComics Selectors', () => {
  let state: LibraryOrganizationState;

  beforeEach(() => {
    state = { ...initialLibraryOrganizationState };
  });

  describe('the busy flag', () => {
    it('should return true when busy', () => {
      expect(
        selectLibraryOrganizationBusy({
          [LIBRARY_ORGANIZATION_FEATURE_KEY]: {
            ...state,
            busy: true
          }
        })
      ).toBeTruthy();
    });

    it('should return false when not busy', () => {
      expect(
        selectLibraryOrganizationBusy({
          [LIBRARY_ORGANIZATION_FEATURE_KEY]: {
            ...state,
            busy: false
          }
        })
      ).toBeFalsy();
    });
  });
});
