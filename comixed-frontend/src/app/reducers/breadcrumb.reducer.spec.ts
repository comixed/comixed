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

import { BreadcrumbState, initialState, reducer } from './breadcrumb.reducer';
import { BREADCRUMB_1, BREADCRUMB_2, BREADCRUMB_3 } from 'app/app.fixtures';
import {
  clearBreadcrumbs,
  setBreadcrumbs
} from 'app/actions/breadcrumb.actions';

describe('Breadcrumb Reducer', () => {
  const ENTRIES = [BREADCRUMB_1, BREADCRUMB_2, BREADCRUMB_3];

  let state: BreadcrumbState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has an empty set of entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('setting the breadcrumb trail', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: [] },
        setBreadcrumbs({ entries: ENTRIES })
      );
    });

    it('sets the entries', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('clearing the breadcrumb trail', () => {
    beforeEach(() => {
      state = reducer({ ...state, entries: ENTRIES }, clearBreadcrumbs());
    });

    it('clears the entries', () => {
      expect(state.entries).toEqual([]);
    });
  });
});
