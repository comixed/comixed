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
  initialRescanComicsState,
  rescanComicsReducer,
  RescanComicsState
} from './rescan-comics.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { RescanComicsActions } from '@app/library/actions/rescan-comics.actions';

describe('RescanComics Reducer', () => {
  let state: RescanComicsState;

  beforeEach(() => {
    state = { ...initialRescanComicsState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = rescanComicsReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('rescanning the selected comics', () => {
    beforeEach(() => {
      state = rescanComicsReducer(
        { ...state, busy: false },
        RescanComicsActions.rescanSelectedComics()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = rescanComicsReducer(
          { ...state, busy: true },
          RescanComicsActions.rescanSelectedComicsSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = rescanComicsReducer(
          { ...state, busy: true },
          RescanComicsActions.rescanSelectedComicsFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
