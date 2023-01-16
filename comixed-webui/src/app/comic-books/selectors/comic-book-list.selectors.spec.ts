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
  COMIC_BOOK_LIST_FEATURE_KEY,
  ComicBookListState
} from '../reducers/comic-book-list.reducer';
import {
  selectComicBookList,
  selectComicBookListCollection,
  selectComicBookListCount,
  selectComicBookListDeletedCount,
  selectComicBookListState
} from './comic-book-list.selectors';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';

describe('ComicBook List Selectors', () => {
  const COMICS = [
    {
      ...COMIC_DETAIL_1,
      lastRead: new Date().getTime(),
      comicState: ComicBookState.STABLE
    },
    { ...COMIC_DETAIL_3, lastRead: null, comicState: ComicBookState.STABLE },
    { ...COMIC_DETAIL_5, lastRead: null, comicState: ComicBookState.DELETED }
  ];
  const COVER_DATE_FILTER = { year: 2022, month: 4 } as CoverDateFilter;
  let state: ComicBookListState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      lastId: Math.floor(Math.abs(Math.random() * 1000)),
      lastPayload: Math.random() > 0.5,
      comicBooks: COMICS,
      unprocessed: COMICS,
      unscraped: COMICS,
      changed: COMICS,
      deleted: COMICS
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicBookListState({
        [COMIC_BOOK_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the comic list', () => {
    expect(
      selectComicBookList({ [COMIC_BOOK_LIST_FEATURE_KEY]: state })
    ).toEqual(state.comicBooks);
  });

  it('should select the number of comics in the list', () => {
    expect(
      selectComicBookListCount({ [COMIC_BOOK_LIST_FEATURE_KEY]: state })
    ).toEqual(state.comicBooks.length);
  });

  it('should select the number of deleted comics in the list', () => {
    expect(
      selectComicBookListDeletedCount({ [COMIC_BOOK_LIST_FEATURE_KEY]: state })
    ).toEqual(
      state.comicBooks.filter(
        comic => comic.comicState === ComicBookState.DELETED
      ).length
    );
  });

  describe('collection types', () => {
    it('can select for publishers', () => {
      expect(
        selectComicBookListCollection(
          { [COMIC_BOOK_LIST_FEATURE_KEY]: state },
          { collectionType: CollectionType.PUBLISHERS }
        )
      ).not.toEqual([]);
    });

    it('can select for series', () => {
      expect(
        selectComicBookListCollection(
          { [COMIC_BOOK_LIST_FEATURE_KEY]: state },
          { collectionType: CollectionType.SERIES }
        )
      ).not.toEqual([]);
    });

    it('can select for characters', () => {
      expect(
        selectComicBookListCollection(
          { [COMIC_BOOK_LIST_FEATURE_KEY]: state },
          { collectionType: CollectionType.CHARACTERS }
        )
      ).not.toEqual([]);
    });

    it('can select for teams', () => {
      expect(
        selectComicBookListCollection(
          { [COMIC_BOOK_LIST_FEATURE_KEY]: state },
          { collectionType: CollectionType.TEAMS }
        )
      ).not.toEqual([]);
    });

    it('can select for locations', () => {
      expect(
        selectComicBookListCollection(
          { [COMIC_BOOK_LIST_FEATURE_KEY]: state },
          { collectionType: CollectionType.LOCATIONS }
        )
      ).not.toEqual([]);
    });

    it('can select for stories', () => {
      expect(
        selectComicBookListCollection(
          { [COMIC_BOOK_LIST_FEATURE_KEY]: state },
          { collectionType: CollectionType.STORIES }
        )
      ).not.toEqual([]);
    });
  });
});
