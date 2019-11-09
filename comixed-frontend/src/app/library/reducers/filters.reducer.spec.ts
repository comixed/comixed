/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { FilterState, initialState, reducer } from './filters.reducer';
import {
  FiltersClear,
  FiltersSetPublisher,
  FiltersSetSeries,
  FiltersSetShowDeleted
} from 'app/library/actions/filters.actions';

describe('Filters Reducer', () => {
  const PUBLISHER = 'The Publisher';
  const SERIES = 'The Series';

  let state: FilterState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('has no publisher', () => {
      expect(state.publisher).toBeNull();
    });

    it('has no series', () => {
      expect(state.series).toBeNull();
    });

    it('does not show deleted comics', () => {
      expect(state.showDeleted).toBeFalsy();
    });
  });

  describe('settings the publisher', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, publisher: null },
        new FiltersSetPublisher({ name: PUBLISHER })
      );
    });

    it('sets the publisher', () => {
      expect(state.publisher).toEqual(PUBLISHER);
    });

    describe('clearing the publisher with an empty string', () => {
      beforeEach(() => {
        state = reducer(state, new FiltersSetPublisher({ name: '' }));
      });

      it('clears the publishr', () => {
        expect(state.publisher).toBeNull();
      });
    });
  });

  describe('settings the series', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, publisher: null },
        new FiltersSetSeries({ name: SERIES })
      );
    });

    it('sets the series', () => {
      expect(state.series).toEqual(SERIES);
    });

    describe('clearing the series with an empty string', () => {
      beforeEach(() => {
        state = reducer(state, new FiltersSetSeries({ name: '' }));
      });

      it('clears the series', () => {
        expect(state.series).toBeNull();
      });
    });
  });

  describe('showing deleted comics', () => {
    it('can show deleted comics', () => {
      state = reducer(
        { ...state, showDeleted: false },
        new FiltersSetShowDeleted({ showDeleted: true })
      );

      expect(state.showDeleted).toBeTruthy();
    });

    it('can hide deleted comics', () => {
      state = reducer(
        { ...state, showDeleted: true },
        new FiltersSetShowDeleted({ showDeleted: false })
      );

      expect(state.showDeleted).toBeFalsy();
    });
  });

  describe('clearing the filters', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, publisher: PUBLISHER, series: SERIES, showDeleted: true },
        new FiltersClear()
      );
    });

    it('has no publisher', () => {
      expect(state.publisher).toBeNull();
    });

    it('has no series', () => {
      expect(state.series).toBeNull();
    });

    it('does not show deleted comics', () => {
      expect(state.showDeleted).toBeFalsy();
    });
  });
});
