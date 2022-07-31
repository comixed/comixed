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

import { initialState, LibraryState, reducer } from './library.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3
} from '@app/comic-books/comic-books.fixtures';
import {
  editMultipleComics,
  editMultipleComicsFailed,
  libraryStateLoaded,
  loadLibraryState,
  loadLibraryStateFailed,
  multipleComicsEdited
} from '@app/library/actions/library.actions';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';

describe('Library Reducer', () => {
  const COMIC = COMIC_BOOK_1;
  const COMICS = [COMIC_BOOK_1, COMIC_BOOK_2, COMIC_BOOK_3];
  const COMIC_IDS = COMICS.map(comic => comic.id);
  const READ = Math.random() > 0.5;
  const TOTAL_COMICS = Math.abs(Math.random() * 100);
  const UNSCRAPED_COMICS = Math.abs(Math.random() * 100);
  const DELETED_COMICS = Math.abs(Math.random() * 100);
  const PUBLISHERS = [{ name: 'Publisher1', count: 1 }];
  const SERIES = [{ name: 'Series1', count: 1 }];
  const CHARACTERS = [{ name: 'Character1', count: 1 }];
  const TEAMS = [{ name: 'Team1', count: 1 }];
  const LOCATIONS = [{ name: 'Location1', count: 1 }];
  const STORIES = [{ name: 'Story1', count: 1 }];
  const STATES = [{ name: ComicBookState.CHANGED.toString(), count: 1 }];

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('is not busy', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('editing multiple comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        editMultipleComics({
          comicBooks: COMICS,
          details: {} as EditMultipleComics
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('successfully editing multiple comics', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, multipleComicsEdited());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('failure editing multiple comics', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, editMultipleComicsFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('loading the current library state', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadLibraryState());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the current library state', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: true,
          totalComics: 0,
          deletedComics: 0,
          publishers: [],
          series: [],
          characters: [],
          teams: [],
          locations: [],
          stories: [],
          states: []
        },
        libraryStateLoaded({
          state: {
            totalComics: TOTAL_COMICS,
            unscrapedComics: UNSCRAPED_COMICS,
            deletedComics: DELETED_COMICS,
            publishers: PUBLISHERS,
            series: SERIES,
            characters: CHARACTERS,
            teams: TEAMS,
            locations: LOCATIONS,
            stories: STORIES,
            states: STATES
          } as RemoteLibraryState
        })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the total comics', () => {
      expect(state.totalComics).toEqual(TOTAL_COMICS);
    });

    it('sets the deleted comics', () => {
      expect(state.deletedComics).toEqual(DELETED_COMICS);
    });

    it('sets the publishers', () => {
      expect(state.publishers).toEqual(PUBLISHERS);
    });

    it('sets the series', () => {
      expect(state.series).toEqual(SERIES);
    });

    it('sets the characters', () => {
      expect(state.characters).toEqual(CHARACTERS);
    });

    it('sets the team', () => {
      expect(state.teams).toEqual(TEAMS);
    });

    it('sets the locations', () => {
      expect(state.locations).toEqual(LOCATIONS);
    });

    it('sets the stories', () => {
      expect(state.stories).toEqual(STORIES);
    });

    it('sets the states', () => {
      expect(state.states).toEqual(STATES);
    });
  });

  describe('failure to load the current library state', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadLibraryStateFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
