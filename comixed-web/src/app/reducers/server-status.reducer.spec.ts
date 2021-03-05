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
  reducer,
  ServerStatusState
} from './server-status.reducer';
import { setTaskCount } from '@app/actions/server-status.actions';

describe('ServerStatus Reducer', () => {
  const TASK_COUNT = Math.abs(Math.floor(Math.random() * 100.0));

  let state: ServerStatusState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no tasks', () => {
      expect(state.taskCount).toEqual(0);
    });
  });

  describe('the task count', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, taskCount: 0 },
        setTaskCount({ count: TASK_COUNT })
      );
    });

    it('sets the task count', () => {
      expect(state.taskCount).toEqual(TASK_COUNT);
    });
  });
});
