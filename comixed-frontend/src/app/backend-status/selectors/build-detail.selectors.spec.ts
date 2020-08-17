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

import {
  BUILD_DETAILS_FEATURE_KEY,
  BuildDetailsState
} from '../reducers/build-details.reducer';
import {
  selectBuildDetails,
  selectBuildDetailsFetching,
  selectBuildDetailState
} from './build-detail.selectors';
import { BUILD_DETAILS_1 } from 'app/backend-status/backend-status.fixtures';

describe('BuildDetail Selectors', () => {
  let state: BuildDetailsState;

  beforeEach(() => {
    state = {
      fetching: Math.random() * 100 > 50,
      details: BUILD_DETAILS_1
    } as BuildDetailsState;
  });

  it('can fetch the whole state', () => {
    expect(
      selectBuildDetailState({
        [BUILD_DETAILS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('can select for the fetching flag', () => {
    expect(
      selectBuildDetailsFetching({ [BUILD_DETAILS_FEATURE_KEY]: state })
    ).toEqual(state.fetching);
  });

  it('can select for the fetching flag', () => {
    expect(selectBuildDetails({ [BUILD_DETAILS_FEATURE_KEY]: state })).toEqual(
      state.details
    );
  });
});
