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
  selectBreadcrumbs,
  selectBreadcrumbState
} from './breadcrumb.selectors';
import {
  BREADCRUMB_FEATURE_KEY,
  BreadcrumbState
} from 'app/reducers/breadcrumb.reducer';
import { BREADCRUMB_1, BREADCRUMB_2, BREADCRUMB_3 } from 'app/app.fixtures';

describe('Breadcrumb Selectors', () => {
  const ENTRIES = [BREADCRUMB_1, BREADCRUMB_2, BREADCRUMB_3];

  let state: BreadcrumbState;

  beforeEach(() => {
    state = { entries: ENTRIES };
  });

  it('selects the feature state', () => {
    expect(
      selectBreadcrumbState({
        [BREADCRUMB_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the entries', () => {
    expect(
      selectBreadcrumbs({
        [BREADCRUMB_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
