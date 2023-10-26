/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  ComicDetailsListState,
  initialState,
  reducer
} from './comic-details-list.reducer';
import {
  comicDetailRemoved,
  comicDetailsLoaded,
  comicDetailUpdated,
  loadComicDetails,
  loadComicDetailsById,
  loadComicDetailsFailed,
  loadComicDetailsForCollection
} from '@app/comic-books/actions/comic-details-list.actions';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { TagType } from '@app/collections/models/comic-collection.enum';

describe('ComicDetailsList Reducer', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const READ_STATE = Math.random() > 0.5;
  const UNSCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const TAG_TYPE = TagType.TEAMS;
  const TAG_VALUE = 'The Avengers';
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const PUBLISHER = COMIC_DETAILS[0].publisher;
  const SERIES = COMIC_DETAILS[0].series;
  const VOLUME = COMIC_DETAILS[0].volume;
  const IDS = COMIC_DETAILS.map(entry => entry.comicId);
  const COVER_YEARS = [1965, 1971, 1996, 1998, 2006];
  const COVER_MONTHS = [1, 3, 4, 7, 9];
  const TOTAL_COUNT = COMIC_DETAILS.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);

  let state: ComicDetailsListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...initialState }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no comic details', () => {
      expect(state.comicDetails).toEqual([]);
    });

    it('has no cover years', () => {
      expect(state.coverYears).toEqual([]);
    });

    it('has no cover months', () => {
      expect(state.coverMonths).toEqual([]);
    });

    it('has no total count', () => {
      expect(state.totalCount).toEqual(0);
    });

    it('has no filtered count', () => {
      expect(state.filteredCount).toEqual(0);
    });
  });

  describe('loading comic details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComicDetails({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('loading comic details by id', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComicDetailsById({ comicBookIds: IDS })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('loading comic details for a collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComicDetailsForCollection({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving comic details', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          comicDetails: [],
          coverYears: [],
          coverMonths: []
        },
        comicDetailsLoaded({
          comicDetails: COMIC_DETAILS,
          coverYears: COVER_YEARS,
          coverMonths: COVER_MONTHS,
          totalCount: TOTAL_COUNT,
          filteredCount: FILTERED_COUNT
        })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the list of comic details', () => {
      expect(state.comicDetails).toEqual(COMIC_DETAILS);
    });

    it('sets the list of cover years', () => {
      expect(state.coverYears).toEqual(COVER_YEARS);
    });

    it('sets the list of cover months', () => {
      expect(state.coverMonths).toEqual(COVER_MONTHS);
    });

    it('sets the total count', () => {
      expect(state.totalCount).toEqual(TOTAL_COUNT);
    });

    it('sets the filtered count', () => {
      expect(state.filteredCount).toEqual(FILTERED_COUNT);
    });
  });

  describe('failure to load comic details', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, comicDetails: COMIC_DETAILS },
        loadComicDetailsFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('leads the comic details intact', () => {
      expect(state.comicDetails).toEqual(COMIC_DETAILS);
    });
  });

  describe('receiving an updated comic detail', () => {
    const ORIGINAL = COMIC_DETAILS[3];
    const UPDATE = {
      ...ORIGINAL,
      comicState: ComicState.CHANGED
    };

    describe('when it is one of the comics shown', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, comicDetails: COMIC_DETAILS },
          comicDetailUpdated({ comicDetail: UPDATE })
        );
      });

      it('removes the original comic', () => {
        expect(state.comicDetails).not.toContain(ORIGINAL);
      });

      it('adds the updated comic', () => {
        expect(state.comicDetails).toContain(UPDATE);
      });
    });

    describe('when it is not one of the comics shown', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            comicDetails: COMIC_DETAILS.filter(entry => entry.id !== UPDATE.id)
          },
          comicDetailUpdated({ comicDetail: UPDATE })
        );
      });

      it('does not add the update', () => {
        expect(state.comicDetails).not.toContain(UPDATE);
      });
    });
  });

  describe('receiving a removed comic detail', () => {
    const ORIGINAL = COMIC_DETAILS[3];

    describe('when it is one of the comics shown', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, comicDetails: COMIC_DETAILS },
          comicDetailRemoved({ comicDetail: ORIGINAL })
        );
      });

      it('removes the original comic', () => {
        expect(state.comicDetails).not.toContain(ORIGINAL);
      });
    });

    describe('when it is not one of the comics shown', () => {
      const DISPLAYED_LIST = COMIC_DETAILS.filter(
        entry => entry.id !== ORIGINAL.id
      );

      beforeEach(() => {
        state = reducer(
          {
            ...state,
            comicDetails: DISPLAYED_LIST
          },
          comicDetailRemoved({ comicDetail: ORIGINAL })
        );
      });

      it('does not change the detail list', () => {
        expect(state.comicDetails).toEqual(DISPLAYED_LIST);
      });
    });
  });
});
