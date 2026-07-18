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
  selectPublisherCount,
  selectPublisherDetail,
  selectPublisherList,
  selectPublisherListBusy
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
  const SERIES_LIST = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];
  const TOTAL_SERIES = SERIES_LIST.length;

  let state: PublisherState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      total: PUBLISHERS.length,
      publishers: PUBLISHERS,
      totalSeries: TOTAL_SERIES,
      detail: SERIES_LIST
    };
  });

  it('selects the publisher list busy flag', () => {
    expect(
      selectPublisherListBusy({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state.busy);
  });

  it('selects the publisher list', () => {
    expect(
      selectPublisherList({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state.publishers);
  });

  it('selects the publisher count', () => {
    expect(
      selectPublisherCount({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state.total);
  });

  it('selects the publisher detail', () => {
    expect(
      selectPublisherDetail({
        [PUBLISHER_FEATURE_KEY]: state
      })
    ).toEqual(state.detail);
  });
});
