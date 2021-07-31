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

import {
  IMPORT_COUNT_FEATURE_KEY,
  ImportCountState
} from '../reducers/import-count.reducer';
import {
  selectImportCount,
  selectImportCountState
} from './import-count.selectors';

describe('ImportCount Selectors', () => {
  let state: ImportCountState;

  beforeEach(() => {
    state = {
      active: Math.random() > 0.5,
      count: Math.abs(Math.floor(Math.random() * 1000))
    };
  });

  it('should select the feature state', () => {
    expect(
      selectImportCountState({
        [IMPORT_COUNT_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the import count', () => {
    expect(
      selectImportCount({
        [IMPORT_COUNT_FEATURE_KEY]: state
      })
    ).toEqual(state.count);
  });
});
