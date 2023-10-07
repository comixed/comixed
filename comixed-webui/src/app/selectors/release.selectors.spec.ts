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

import { selectReleaseDetailsState } from './release.selectors';
import {
  RELEASE_DETAILS_FEATURE_KEY,
  ReleaseDetailsState
} from '@app/reducers/release.reducer';
import { CURRENT_RELEASE, LATEST_RELEASE } from '@app/app.fixtures';

describe('Release Selectors', () => {
  let state: ReleaseDetailsState;

  beforeEach(() => {
    state = {
      currentLoading: Math.random() > 0.5,
      current: CURRENT_RELEASE,
      latestLoading: Math.random() > 0.5,
      loaded: Math.random() > 0.5,
      latest: LATEST_RELEASE
    };
  });

  it('selects the feature state', () => {
    expect(
      selectReleaseDetailsState({
        [RELEASE_DETAILS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
