/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { ComicListState, initialState, reducer } from './comic-list.reducer';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { TagType } from '@app/collections/models/comic-collection.enum';
import {
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import {
  comicRemoved,
  comicUpdated,
  loadComicsByFilter,
  loadComicsById,
  loadComicsFailure,
  loadComicsForCollection,
  loadComicsForReadingList,
  loadComicsSuccess,
  loadDuplicateComics,
  loadReadComics,
  loadUnreadComics,
  resetComicList
} from '@app/comic-books/actions/comic-list.actions';

describe('ComicList Reducer', () => {
  const PAGE_SIZE = 25;
  const PAGE_INDEX = Math.abs(Math.random() * 1000);
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const SELECTED_STATE = Math.random() > 0.5;
  const UNSCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const SORT_BY = 'addedDate';
  const SORT_DIRECTION = 'ASC';
  const TAG_TYPE = TagType.TEAMS;
  const TAG_VALUE = 'The Avengers';
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const PUBLISHER = COMIC_LIST[0].publisher;
  const SERIES = COMIC_LIST[0].series;
  const VOLUME = COMIC_LIST[0].volume;
  const IDS = COMIC_LIST.map(entry => entry.comicBookId);
  const COVER_YEARS = [1965, 1971, 1996, 1998, 2006];
  const COVER_MONTHS = [1, 3, 4, 7, 9];
  const TOTAL_COUNT = COMIC_LIST.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);
  const READING_LIST_ID = READING_LIST_3.id;

  let state: ComicListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...initialState }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
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

  describe('resetting the comic list', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          comics: COMIC_LIST,
          coverYears: COVER_YEARS,
          coverMonths: COVER_MONTHS,
          totalCount: TOTAL_COUNT,
          filteredCount: FILTERED_COUNT
        },
        resetComicList()
      );
    });

    it('clears the list of comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('clears the list of cover years', () => {
      expect(state.coverYears).toEqual([]);
    });

    it('clears the list of cover months', () => {
      expect(state.coverMonths).toEqual([]);
    });

    it('clears the list of cover months', () => {
      expect(state.coverMonths).toEqual([]);
    });

    it('resets the total count', () => {
      expect(state.totalCount).toEqual(0);
    });

    it('resets the filtered count', () => {
      expect(state.filteredCount).toEqual(0);
    });
  });

  describe('loading comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadComicsByFilter({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          selected: SELECTED_STATE,
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

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading comics by id', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadComicsById({ ids: IDS }));
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading comics for a collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadComicsForCollection({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading comics that are unread', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadUnreadComics({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading read comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadReadComics({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading unread comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadComicsForReadingList({
          readingListId: READING_LIST_ID,
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('loading duplicate comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadDuplicateComics({
          pageSize: PAGE_SIZE,
          pageIndex: PAGE_INDEX,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving comics', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: true,
          comics: [],
          coverYears: [],
          coverMonths: []
        },
        loadComicsSuccess({
          comics: COMIC_LIST,
          coverYears: COVER_YEARS,
          coverMonths: COVER_MONTHS,
          totalCount: TOTAL_COUNT,
          filteredCount: FILTERED_COUNT
        })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the list of comics', () => {
      expect(state.comics).toEqual(COMIC_LIST);
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

  describe('failure to load comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, comics: COMIC_LIST },
        loadComicsFailure()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('leaves the comic intact', () => {
      expect(state.comics).toEqual(COMIC_LIST);
    });
  });

  describe('receiving an updated comic', () => {
    const ORIGINAL = COMIC_LIST[3];
    const UPDATE = {
      ...ORIGINAL,
      comicState: ComicState.CHANGED
    };

    describe('when it is one of the comics shown', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, comics: COMIC_LIST },
          comicUpdated({ comic: UPDATE })
        );
      });

      it('removes the original comic', () => {
        expect(state.comics).not.toContain(ORIGINAL);
      });

      it('adds the updated comic', () => {
        expect(state.comics).toContain(UPDATE);
      });
    });

    describe('when it is not one of the comics shown', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            comics: COMIC_LIST.filter(
              entry => entry.comicBookId !== UPDATE.comicBookId
            )
          },
          comicUpdated({ comic: UPDATE })
        );
      });

      it('does not add the update', () => {
        expect(state.comics).not.toContain(UPDATE);
      });
    });
  });

  describe('receiving a removed comic', () => {
    const ORIGINAL = COMIC_LIST[3];

    describe('when it is one of the comics shown', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, comics: COMIC_LIST },
          comicRemoved({ comic: ORIGINAL })
        );
      });

      it('removes the original comic', () => {
        expect(state.comics).not.toContain(ORIGINAL);
      });
    });

    describe('when it is not one of the comics shown', () => {
      const DISPLAYED_LIST = COMIC_LIST.filter(
        entry => entry.comicBookId !== ORIGINAL.comicBookId
      );

      beforeEach(() => {
        state = reducer(
          {
            ...state,
            comics: DISPLAYED_LIST
          },
          comicRemoved({ comic: ORIGINAL })
        );
      });

      it('does not change the comic list', () => {
        expect(state.comics).toEqual(DISPLAYED_LIST);
      });
    });
  });
});
