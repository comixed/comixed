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
  METADATA_FEATURE_KEY,
  MetadataState
} from '../reducers/metadata.reducer';
import {
  selectChosenMetadataSource,
  selectIssueMetadata,
  selectMetadataState,
  selectVolumeMetadata
} from './metadata.selectors';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';

describe('Metadata Selectors', () => {
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;

  let state: MetadataState;

  beforeEach(() => {
    state = {
      loadingRecords: Math.random() > 0.5,
      clearingCache: Math.random() > 0.5,
      volumes: VOLUMES,
      scrapingIssue: SCRAPING_ISSUE,
      metadataSource: METADATA_SOURCE_1,
      confirmBeforeScraping: Math.random() > 0.5,
      autoSelectExactMatch: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMetadataState({
        [METADATA_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the scraping volumes', () => {
    expect(
      selectVolumeMetadata({
        [METADATA_FEATURE_KEY]: state
      })
    ).toEqual(state.volumes);
  });

  it('should select the scraping issue', () => {
    expect(
      selectIssueMetadata({
        [METADATA_FEATURE_KEY]: state
      })
    ).toEqual(state.scrapingIssue);
  });

  it('should select the selected metadata source', () => {
    expect(
      selectChosenMetadataSource({
        [METADATA_FEATURE_KEY]: state
      })
    ).toEqual(state.metadataSource);
  });
});
