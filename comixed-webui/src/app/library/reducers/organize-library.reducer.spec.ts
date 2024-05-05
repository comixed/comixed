/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
  initialState,
  OrganizeLibraryState,
  reducer
} from './organize-library.reducer';
import {
  startEntireLibraryOrganization,
  startEntireLibraryOrganizationFailure,
  startEntireLibraryOrganizationSuccess,
  startLibraryOrganization,
  startLibraryOrganizationFailure,
  startLibraryOrganizationSuccess
} from '@app/library/actions/organize-library.actions';

describe('OrganizeLibrary Reducer', () => {
  const IDS = [1000, 1001, 1002, 1003];

  let state: OrganizeLibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });

  describe('starting organization', () => {
    beforeEach(() => {
      state = reducer({ ...state, sending: false }, startLibraryOrganization());
    });

    it('sets the sending flag', () => {
      expect(state.sending).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, sending: true },
          startLibraryOrganizationSuccess()
        );
      });

      it('clears the sending flag', () => {
        expect(state.sending).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, sending: true },
          startLibraryOrganizationFailure()
        );
      });

      it('clears the sending flag', () => {
        expect(state.sending).toBeFalse();
      });
    });
  });

  describe('starting organization the entire library', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, sending: false },
        startEntireLibraryOrganization()
      );
    });

    it('sets the sending flag', () => {
      expect(state.sending).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, sending: true },
          startEntireLibraryOrganizationSuccess()
        );
      });

      it('clears the sending flag', () => {
        expect(state.sending).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, sending: true },
          startEntireLibraryOrganizationFailure()
        );
      });

      it('clears the sending flag', () => {
        expect(state.sending).toBeFalse();
      });
    });
  });
});
