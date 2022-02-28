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
  METADATA_SOURCE_FEATURE_KEY,
  MetadataSourceState
} from '../reducers/metadata-source.reducer';
import {
  selectMetadataSource,
  selectMetadataSourceState
} from './metadata-source.selectors';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';

describe('MetadataSource Selectors', () => {
  let state: MetadataSourceState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      source: METADATA_SOURCE_1
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMetadataSourceState({
        [METADATA_SOURCE_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the metadata source', () => {
    expect(
      selectMetadataSource({
        [METADATA_SOURCE_FEATURE_KEY]: state
      })
    ).toEqual(state.source);
  });
});
