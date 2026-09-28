/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  initialPublisherListState,
  publisherListAdaptor,
  publisherListReducer,
  PublisherListState
} from '../reducers/publisher-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { PublisherListActions } from '@app/library/actions/publisher-list.actions';
import { PUBLISHER_1 } from '@app/library/library-fixtures';

describe('PublisherList Reducer', () => {
  const TEST_PUBLISHER_LIST = [PUBLISHER_1];
  const TEST_TOTAL = 61;

  let state: PublisherListState;

  beforeEach(() => {
    state = { ...initialPublisherListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = publisherListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('should have no publishers', () => {
      expect(
        publisherListAdaptor.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });

    it('should have a zero total count', () => {
      expect(state.total).toBe(0);
    });
  });

  describe('loading the publisher list', () => {
    beforeEach(() => {
      state = publisherListReducer(
        { ...state, loading: false },
        PublisherListActions.load({
          searchText: '',
          page: 0,
          size: 10,
          sortBy: '',
          sortDirection: ''
        })
      );
    });

    it('should set the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = publisherListReducer(
          publisherListAdaptor.setAll([], {
            ...state,
            loading: true,
            total: 0
          }),
          PublisherListActions.loadSuccess({
            publishers: TEST_PUBLISHER_LIST,
            total: TEST_TOTAL
          })
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the publisher list', () => {
        expect(
          publisherListAdaptor.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_PUBLISHER_LIST);
      });

      it('should set the total count', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = publisherListReducer(
          { ...state, loading: true },
          PublisherListActions.loadFailure()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });
    });
  });
});
