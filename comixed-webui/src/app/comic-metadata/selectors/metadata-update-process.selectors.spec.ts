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
  METADATA_UPDATE_PROCESS_FEATURE_KEY,
  MetadataUpdateProcessState
} from '../reducers/metadata-update-process.reducer';
import { selectMetadataUpdateProcessState } from './metadata-update-process.selectors';

describe('MetadataUpdateProcess Selectors', () => {
  let state: MetadataUpdateProcessState;

  beforeEach(() => {
    state = {
      active: Math.random() > 0.5,
      totalComics: Math.abs(Math.random() * 100),
      completedComics: Math.abs(Math.random() * 100)
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMetadataUpdateProcessState({
        [METADATA_UPDATE_PROCESS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
