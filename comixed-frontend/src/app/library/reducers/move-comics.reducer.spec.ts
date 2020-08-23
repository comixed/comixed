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

import { initialState, MoveComicsState, reducer } from './move-comics.reducer';
import {
  comicsMoving,
  moveComics
} from 'app/library/actions/move-comics.actions';

describe('MoveComics Reducer', () => {
  const DIRECTORY = '/Users/comxedreader/Documents/comics';
  const DELETE_FILES = Math.random() * 100 > 50;
  const RENAMING_RULES =
    '$PUBLISHER/$SERIES/$VOLUME/$SERIES [$VOLUME] #$ISSUE ($COVERDATE)';

  let state: MoveComicsState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });

    it('clears the success flag', () => {
      expect(state.success).toBeFalsy();
    });
  });

  describe('starting the move process', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting: false, success: true },
        moveComics({
          directory: DIRECTORY,
          deletePhysicalFiles: DELETE_FILES,
          renamingRule: RENAMING_RULES
        })
      );
    });

    it('sets the starting flag', () => {
      expect(state.starting).toBeTruthy();
    });

    it('clears the success flag', () => {
      expect(state.success).toBeFalsy();
    });
  });

  describe('the moving started successfully', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, starting: true, success: false },
        comicsMoving()
      );
    });

    it('clears the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });

    it('sets the success flag', () => {
      expect(state.success).toBeTruthy();
    });
  });

  describe('when moving fails to start', () => {
    beforeEach(() => {
      state = reducer({ ...state, starting: true }, comicsMoving());
    });

    it('clears the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });
  });
});
