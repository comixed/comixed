/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  PUBLISHER_FEATURE_KEY,
  PublisherState
} from '../reducers/publisher.reducer';
import {
  selectPublisherDetail,
  selectPublisherList,
  selectPublisherState
} from './publisher.selectors';
import {
  PUBLISHER_1,
  PUBLISHER_2,
  PUBLISHER_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';

describe('Publisher Selectors', () => {
  const PUBLISHERS = [PUBLISHER_1, PUBLISHER_2, PUBLISHER_3];
  const DETAIL = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];

  let state: PublisherState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      publishers: PUBLISHERS,
      detail: DETAIL
    };
  });

  it('should select the feature state', () => {
    expect(
      selectPublisherState({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the publisher list', () => {
    expect(
      selectPublisherList({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state.publishers);
  });

  it('should select the publisher detail', () => {
    expect(
      selectPublisherDetail({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state.detail);
  });
});
