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

import { initialState, PublisherState, reducer } from './publisher.reducer';
import {
  loadPublisherDetail,
  loadPublisherDetailFailure,
  loadPublisherDetailSuccess,
  loadPublisherList,
  loadPublisherListFailure,
  loadPublisherListSuccess
} from '@app/collections/actions/publisher.actions';
import {
  PUBLISHER_1,
  PUBLISHER_2,
  PUBLISHER_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';

describe('Publisher Reducer', () => {
  const PUBLISHERS = [PUBLISHER_1, PUBLISHER_2, PUBLISHER_3];
  const PUBLISHER = PUBLISHER_3;
  const SERIES_LIST = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];
  const TOTAL_SERIES = SERIES_LIST.length;
  const PAGE_INDEX = 3;
  const PAGE_SIZE = 25;
  const SORT_BY = 'name';
  const SORT_DIRECTION = 'asc';

  let state: PublisherState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the total', () => {
      expect(state.total).toEqual(0);
    });

    it('has no publishers', () => {
      expect(state.publishers).toEqual([]);
    });

    it('has no total series', () => {
      expect(state.totalSeries).toEqual(0);
    });

    it('has no detail', () => {
      expect(state.detail).toEqual([]);
    });
  });

  describe('loading a page of publishers', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false, publishers: PUBLISHERS },
        loadPublisherList({
          page: 3,
          size: 25,
          sortBy: 'name',
          sortDirection: 'asc'
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('resets the publisher list', () => {
      expect(state.publishers).toEqual([]);
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...initialState, busy: true, total: 0, publishers: [] },
          loadPublisherListSuccess({
            total: PUBLISHERS.length,
            publishers: PUBLISHERS
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the total', () => {
        expect(state.total).toEqual(PUBLISHERS.length);
      });

      it('sets the list of publishers', () => {
        expect(state.publishers).toEqual(PUBLISHERS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...initialState, busy: true },
          loadPublisherListFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('loading a single publisher', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, detail: SERIES_LIST },
        loadPublisherDetail({
          name: PUBLISHER.name,
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the detail', () => {
      expect(state.detail).toEqual([]);
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, detail: [] },
          loadPublisherDetailSuccess({
            totalSeries: TOTAL_SERIES,
            detail: SERIES_LIST
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the total number of series', () => {
        expect(state.totalSeries).toEqual(TOTAL_SERIES);
      });

      it('sets the series list', () => {
        expect(state.detail).toEqual(SERIES_LIST);
      });
    });

    describe('failure to receive a single publisher', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, loadPublisherDetailFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
