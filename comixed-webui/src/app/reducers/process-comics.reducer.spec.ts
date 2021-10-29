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
  ProcessComicsState,
  reducer
} from './process-comics.reducer';
import { processComicsUpdate } from '@app/actions/process-comics.actions';

describe('ProcessComics Reducer', () => {
  const ACTIVE = Math.random() > 0.5;
  const STARTED = new Date().getTime();
  const STEP_NAME = 'step-name';
  const TOTAL = 73;
  const PROCESSED = 37;

  let state: ProcessComicsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the active flag', () => {
      expect(state.active).toBeFalse();
    });

    it('has no started date', () => {
      expect(state.started).toEqual(0);
    });

    it('has no step name', () => {
      expect(state.stepName).toEqual('');
    });

    it('has no total comic count', () => {
      expect(state.total).toEqual(0);
    });

    it('has no processed comic count', () => {
      expect(state.processed).toEqual(0);
    });
  });

  describe('updating the count', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          active: !ACTIVE,
          started: 0,
          stepName: '',
          total: 0,
          processed: 0
        },
        processComicsUpdate({
          active: ACTIVE,
          started: STARTED,
          stepName: STEP_NAME,
          total: TOTAL,
          processed: PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.active).toEqual(ACTIVE);
    });

    it('sets the started date', () => {
      expect(state.started).toEqual(STARTED);
    });

    it('sets the step name', () => {
      expect(state.stepName).toEqual(STEP_NAME);
    });

    it('sets the total count', () => {
      expect(state.total).toEqual(TOTAL);
    });

    it('sets the processed count', () => {
      expect(state.processed).toEqual(PROCESSED);
    });
  });
});
