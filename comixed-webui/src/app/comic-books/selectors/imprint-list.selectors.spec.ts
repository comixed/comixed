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
  IMPRINT_LIST_FEATURE_KEY,
  ImprintListState
} from '../reducers/imprint-list.reducer';
import { selectImprintListState } from './imprint-list.selectors';
import {
  IMPRINT_1,
  IMPRINT_2,
  IMPRINT_3
} from '@app/comic-books/comic-book.fixtures';

describe('ImprintList Selectors', () => {
  const ENTRIES = [IMPRINT_1, IMPRINT_2, IMPRINT_3];

  let state: ImprintListState;

  beforeEach(() => {
    state = { loading: Math.random() > 0.5, entries: ENTRIES };
  });

  it('should select the feature state', () => {
    expect(
      selectImprintListState({
        [IMPRINT_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
