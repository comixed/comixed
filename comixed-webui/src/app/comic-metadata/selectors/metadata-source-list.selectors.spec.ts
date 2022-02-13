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
  METADATA_SOURCE_LIST_FEATURE_KEY,
  MetadataSourceListState
} from '../reducers/metadata-source-list.reducer';
import {
  selectMetadataSourceList,
  selectMetadataSourceListState
} from './metadata-source-list.selectors';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';

describe('MetadataSourceList Selectors', () => {
  let state: MetadataSourceListState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      sources: [METADATA_SOURCE_1]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMetadataSourceListState({
        [METADATA_SOURCE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the metadata source list', () => {
    expect(
      selectMetadataSourceList({
        [METADATA_SOURCE_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.sources);
  });
});
