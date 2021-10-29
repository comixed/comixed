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
  PROCESS_COMICS_FEATURE_KEY,
  ProcessComicsState
} from '../reducers/process-comics.reducer';
import { selectProcessComicsState } from './process-comics.selectors';

describe('ProcessComics Selectors', () => {
  let state: ProcessComicsState;

  beforeEach(() => {
    state = {
      active: Math.random() > 0.5,
      started: new Date().getTime(),
      stepName: 'step-name',
      total: Math.abs(Math.floor(Math.random() * 1000)),
      processed: Math.abs(Math.floor(Math.random() * 1000))
    };
  });

  it('should select the feature state', () => {
    expect(
      selectProcessComicsState({
        [PROCESS_COMICS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
