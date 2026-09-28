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
  libraryOrganizationReducer,
  LibraryOrganizationState
} from './library-organization.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { LibraryOrganizationActions } from '@app/library/actions/library-organization.actions';

describe('LibraryOrganization Reducer', () => {
  let state: LibraryOrganizationState;

  beforeEach(() => {
    state = { ...initialLibraryOrganizationState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = libraryOrganizationReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('organizing selected comics', () => {
    beforeEach(() => {
      state = libraryOrganizationReducer(
        { ...state, busy: false },
        LibraryOrganizationActions.organizeSelectedComics()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = libraryOrganizationReducer(
          { ...state, busy: true },
          LibraryOrganizationActions.organizeSelectedComicsSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = libraryOrganizationReducer(
          { ...state, busy: true },
          LibraryOrganizationActions.organizeSelectedComicsFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('organizing all comics', () => {
    beforeEach(() => {
      state = libraryOrganizationReducer(
        { ...state, busy: false },
        LibraryOrganizationActions.organizeAllComics()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = libraryOrganizationReducer(
          { ...state, busy: true },
          LibraryOrganizationActions.organizeAllComicsSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = libraryOrganizationReducer(
          { ...state, busy: true },
          LibraryOrganizationActions.organizeAllComicsFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
