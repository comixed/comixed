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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { CollectionState, initialState, reducer } from './collection.reducer';
import {
  CollectionComicsReceived,
  CollectionGetComics,
  CollectionGetComicsFailed,
  CollectionLoad,
  CollectionLoadFailed,
  CollectionReceived
} from 'app/library/actions/collection.actions';
import { CollectionType } from 'app/library/models/collection-type.enum';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from 'app/library/models/collection-entry.fixtures';
import { COMIC_1, COMIC_2, COMIC_3 } from 'app/comics/comics.fixtures';

describe('Collection Reducer', () => {
  const COLLECTION_TYPE = CollectionType.PUBLISHERS;
  const COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const COLLECTION_NAME = 'Fancy Publisher';
  const PAGE = 17;
  const COUNT = 25;
  const SORT_FIELD = 'addedDate';
  const ASCENDING = false;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const COMIC_COUNT = 3;

  let state: CollectionState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching entries flag', () => {
      expect(state.fetchingEntries).toBeFalsy();
    });

    it('has no default collection', () => {
      expect(state.type).toBeNull();
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('has no selected entry', () => {
      expect(state.selected).toBeNull();
    });

    it('clears the fetching comics flag', () => {
      expect(state.fetchingEntry).toBeFalsy();
    });

    it('has page of 0', () => {
      expect(state.page).toEqual(0);
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has a comic count of 0', () => {
      expect(state.comicCount).toEqual(0);
    });
  });

  describe('getting entries for a collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntries: false, type: null },
        new CollectionLoad({ collectionType: COLLECTION_TYPE })
      );
    });

    it('sets the fetching entries flag', () => {
      expect(state.fetchingEntries).toBeTruthy();
    });

    it('sets the collection type', () => {
      expect(state.type).toEqual(COLLECTION_TYPE);
    });
  });

  describe('receiving entries for a collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntries: true, entries: [] },
        new CollectionReceived({ entries: COLLECTION_ENTRIES })
      );
    });

    it('clears the fetching entries flag', () => {
      expect(state.fetchingEntries).toBeFalsy();
    });

    it('sets the list of entries', () => {
      expect(state.entries).toEqual(COLLECTION_ENTRIES);
    });
  });

  describe('failure to get entries for a collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntries: true },
        new CollectionLoadFailed()
      );
    });

    it('clears the fetching entries flag', () => {
      expect(state.fetchingEntries).toBeFalsy();
    });
  });

  describe('get a single collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntry: false },
        new CollectionGetComics({
          collectionType: COLLECTION_TYPE,
          name: COLLECTION_NAME,
          page: PAGE,
          count: COUNT,
          sortField: SORT_FIELD,
          ascending: ASCENDING
        })
      );
    });

    it('sets the fetching entry flag', () => {
      expect(state.fetchingEntry).toBeTruthy();
    });

    it('sets the current page', () => {
      expect(state.page).toEqual(PAGE);
    });
  });

  describe('when a collection has been received', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingEntry: true,
          selected: null,
          comics: [],
          page: PAGE - 3
        },
        new CollectionComicsReceived({
          comics: COMICS,
          comicCount: COMIC_COUNT
        })
      );
    });

    it('clears the fetching entries flag', () => {
      expect(state.fetchingEntry).toBeFalsy();
    });

    it('updates the comics', () => {
      expect(state.comics).toEqual(COMICS);
    });

    it('updates the comic count', () => {
      expect(state.comicCount).toEqual(COMIC_COUNT);
    });
  });

  describe('failure to get a collection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingEntry: true },
        new CollectionGetComicsFailed()
      );
    });

    it('clears the fetching entries flag', () => {
      expect(state.fetchingEntry).toBeFalsy();
    });
  });
});
