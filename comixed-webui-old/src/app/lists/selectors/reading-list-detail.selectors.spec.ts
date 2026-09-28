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
  READING_LIST_DETAIL_FEATURE_KEY,
  ReadingListDetailState
} from '../reducers/reading-list-detail.reducer';
import {
  selectReadingList,
  selectReadingListBusy,
  selectReadingListNotFound
} from './reading-list-detail.selectors';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';

describe('LoadReadingList Selectors', () => {
  const READING_LIST = READING_LIST_3;

  let state: ReadingListDetailState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      notFound: Math.random() > 0.5,
      list: READING_LIST,
      saving: Math.random() > 0.5
    };
  });

  describe('the busy state', () => {
    it('returns true when loading', () => {
      expect(
        selectReadingListBusy({
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...state,
            loading: true,
            saving: false
          }
        })
      ).toEqual(true);
    });

    it('returns true when saving', () => {
      expect(
        selectReadingListBusy({
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...state,
            loading: false,
            saving: true
          }
        })
      ).toEqual(true);
    });

    it('returns false when neither loading nor saving', () => {
      expect(
        selectReadingListBusy({
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...state,
            loading: false,
            saving: false
          }
        })
      ).toEqual(false);
    });
  });

  describe('when the list is not found', () => {
    it('returns false when loading', () => {
      expect(
        selectReadingListNotFound({
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...state,
            loading: true,
            notFound: false
          }
        })
      ).toEqual(false);
    });

    it('returns false when found', () => {
      expect(
        selectReadingListNotFound({
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...state,
            loading: false,
            notFound: false
          }
        })
      ).toEqual(false);
    });

    it('returns true when not found', () => {
      expect(
        selectReadingListNotFound({
          [READING_LIST_DETAIL_FEATURE_KEY]: {
            ...state,
            loading: false,
            notFound: true
          }
        })
      ).toEqual(true);
    });
  });

  it('selects the reading list', () => {
    expect(
      selectReadingList({
        [READING_LIST_DETAIL_FEATURE_KEY]: state
      })
    ).toEqual(state.list);
  });
});
