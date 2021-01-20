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
import { COMIC_1, COMIC_2, COMIC_3 } from '@app/library/library.fixtures';
import {
  comicLoaded,
  deselectComics,
  loadComic,
  loadComicFailed,
  readStateSet,
  selectComics,
  setReadState,
  setReadStateFailed,
  updateComics
} from '@app/library/actions/library.actions';
import { Comic } from '@app/library';

describe('Library Reducer', () => {
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const READ = Math.random() > 0.5;

  let state: LibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no current comic', () => {
      expect(state.comic).toBeNull();
    });

    it('has no comics', () => {
      expect(state.comics).toEqual([]);
    });

    it('has no selected comic', () => {
      expect(state.selected).toEqual([]);
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('loading a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadComic({ id: COMIC.id })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving a comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, comic: null },
        comicLoaded({ comic: COMIC })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the comic', () => {
      expect(state.comic).toEqual(COMIC);
    });
  });

  describe('failure to load a comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadComicFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('receiving comic updates', () => {
    const OLD_COMIC = COMIC;
    const UPDATED_COMIC: Comic = {
      ...OLD_COMIC,
      series: OLD_COMIC.series.substr(1)
    };
    const NEW_COMIC = COMIC_2;
    const REMOVED_COMIC = COMIC_3;

    beforeEach(() => {
      state = reducer(
        { ...state, comics: [OLD_COMIC, REMOVED_COMIC] },
        updateComics({
          updated: [UPDATED_COMIC, NEW_COMIC],
          removed: [REMOVED_COMIC.id]
        })
      );
    });

    it('adds the new comic to the collection', () => {
      expect(state.comics).toContain(NEW_COMIC);
    });

    it('replaces the updated comic', () => {
      expect(state.comics).not.toContain(OLD_COMIC);
      expect(state.comics).toContain(UPDATED_COMIC);
    });

    it('does not contain the removed comic', () => {
      expect(state.comics).not.toContain(REMOVED_COMIC);
    });
  });

  describe('selecting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selected: [] },
        selectComics({ comics: COMICS })
      );
    });

    it('sets the selected comics', () => {
      expect(state.selected).toEqual(COMICS);
    });

    describe('reselecting the same comic', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, selected: COMICS },
          selectComics({ comics: COMICS })
        );
      });

      it('does not reselect the same comics', () => {
        expect(state.selected).toEqual(COMICS);
      });
    });
  });

  describe('deselecting comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, selected: COMICS },
        deselectComics({ comics: [COMIC] })
      );
    });

    it('removes the deselected comics', () => {
      expect(state.selected).not.toContain(COMIC);
    });

    it('leaves the remaining comics selected', () => {
      expect(state.selected).not.toEqual([]);
    });

    describe('deselecting all comics', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, selected: COMICS },
          deselectComics({ comics: COMICS })
        );
      });

      it('clears the selected comics', () => {
        expect(state.selected).toEqual([]);
      });
    });
  });

  describe('setting the read state for comics', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        setReadState({ comics: COMICS, read: READ })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('successfully setting the read state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, readStateSet());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('failure setting the read state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, setReadStateFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
