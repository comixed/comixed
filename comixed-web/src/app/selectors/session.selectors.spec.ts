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

import { SESSION_FEATURE_KEY, SessionState } from '../reducers/session.reducer';
import { selectUserSessionState } from './session.selectors';

describe('UserSession Selectors', () => {
  let state: SessionState;

  beforeEach(() => {
    state = {
      initialized: Math.random() > 0.5,
      loading: Math.random() > 0.5,
      importCount: 717,
      latest: new Date().getTime()
    };
  });

  it('should select the feature state', () => {
    expect(
      selectUserSessionState({
        [SESSION_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
