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

import { BUSY_FEATURE_KEY, BusyState } from '../reducers/busy.reducer';
import { selectBusyState } from './busy.selectors';
import { BusyIcon } from '@app/core/actions/busy.actions';

describe('Busy Selectors', () => {
  let state: BusyState;

  beforeEach(() => {
    state = { enabled: Math.random() > 0.5, icon: BusyIcon.WORKING };
  });

  it('should select the feature state', () => {
    expect(
      selectBusyState({
        [BUSY_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
