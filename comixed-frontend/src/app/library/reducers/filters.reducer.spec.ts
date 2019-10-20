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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { reducer, initialState, FilterState } from './filters.reducer';
import {
  FiltersSetEarliestYearPublished,
  FiltersSetLatestYearPublished,
  FiltersSetPublisher,
  FiltersSetSeries,
  FiltersSetVolume
} from 'app/library/actions/filters.actions';

describe('Filters Reducer', () => {
  const PUBLISHER = 'The Publisher';
  const SERIES = 'The Series';
  const VOLUME = 'The Volume';
  const EARLIEST_DATE = 1980;
  const LATEST_DATE = 2019;

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

    it('has no volume', () => {
      expect(state.volume).toBeNull();
    });

    it('has no earliest cover date', () => {
      expect(state.earliestYearPublished).toBeNull();
    });

    it('has no latest cover date', () => {
      expect(state.latestYearPublished).toBeNull();
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

    describe('settings the earliest year', () => {
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

        it('clears the publisehr', () => {
          expect(state.publisher).toBeNull();
        });
      });
    });
  });

  describe('settings the volume', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, publisher: null },
        new FiltersSetVolume({ name: VOLUME })
      );
    });

    it('sets the volume', () => {
      expect(state.volume).toEqual(VOLUME);
    });

    describe('clearing the volume with an empty string', () => {
      beforeEach(() => {
        state = reducer(state, new FiltersSetVolume({ name: '' }));
      });

      it('clears the volume', () => {
        expect(state.volume).toBeNull();
      });
    });
  });

  describe('settings the earliest cover year', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, earliestYearPublished: null },
        new FiltersSetEarliestYearPublished({ year: EARLIEST_DATE })
      );
    });

    it('sets the earliest cover year', () => {
      expect(state.earliestYearPublished).toEqual(EARLIEST_DATE);
    });

    describe('clearing the publisher with an empty string', () => {
      beforeEach(() => {
        state = reducer(state, new FiltersSetEarliestYearPublished({ year: 0 }));
      });

      it('clears the earliest cover year', () => {
        expect(state.publisher).toBeNull();
      });
    });
  });

  describe('settings the latest cover year filter', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, latestYearPublished: null },
        new FiltersSetLatestYearPublished({ year: LATEST_DATE })
      );
    });

    it('sets the latest cover year', () => {
      expect(state.latestYearPublished).toEqual(LATEST_DATE);
    });

    describe('clearing the latest cover year', () => {
      beforeEach(() => {
        state = reducer(state, new FiltersSetLatestYearPublished({ year: 0 }));
      });

      it('clears the latest cover year', () => {
        expect(state.latestYearPublished).toBeNull();
      });
    });
  });
});
