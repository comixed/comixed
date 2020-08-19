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
  SCRAPING_VOLUMES_FEATURE_KEY,
  ScrapingVolumesState
} from '../reducers/scraping-volumes.reducer';
import {
  selectScrapingVolumes,
  selectScrapingVolumesFetching,
  selectScrapingVolumesState
} from './scraping-volumes.selectors';
import {
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from 'app/comics/comics.fixtures';

describe('ScrapingVolumes Selectors', () => {
  const VOLUMES = [
    SCRAPING_VOLUME_1001,
    SCRAPING_VOLUME_1002,
    SCRAPING_VOLUME_1003,
    SCRAPING_VOLUME_1004,
    SCRAPING_VOLUME_1005
  ];

  let state: ScrapingVolumesState;

  beforeEach(() => {
    state = {
      fetching: Math.random() * 100 > 50,
      volumes: VOLUMES
    } as ScrapingVolumesState;
  });

  it('should select the feature state', () => {
    expect(
      selectScrapingVolumesState({
        [SCRAPING_VOLUMES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the fetching state', () => {
    expect(
      selectScrapingVolumesFetching({
        [SCRAPING_VOLUMES_FEATURE_KEY]: state
      })
    ).toEqual(state.fetching);
  });

  it('should select the volumes state', () => {
    expect(
      selectScrapingVolumes({
        [SCRAPING_VOLUMES_FEATURE_KEY]: state
      })
    ).toEqual(state.volumes);
  });
});
