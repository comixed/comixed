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

import { ComicState, initialState, reducer } from './comic.reducer';
import { COMIC_2, COMIC_4 } from '@app/library/library.fixtures';
import {
  comicLoaded,
  comicUpdated,
  loadComic,
  loadComicFailed,
  updateComic,
  updateComicFailed
} from '@app/library/actions/comic.actions';

describe('Comic Reducer', () => {
  const COMIC = COMIC_2;

  let state: ComicState;

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

    it('has no comic', () => {
      expect(state.comic).toBeNull();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('loading a single comic', () => {
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

  describe('receiving a single comic', () => {
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

  describe('failure to load a single comic', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadComicFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('updating a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false, saved: true },
        updateComic({ comic: COMIC })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('successfully updating a single comic', () => {
    const UPDATED_COMIC = { ...COMIC, filename: COMIC.filename.substr(1) };

    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: false, comic: COMIC },
        comicUpdated({ comic: UPDATED_COMIC })
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('sets the saved flag', () => {
      expect(state.saved).toBeTrue();
    });

    it('updates the comic', () => {
      expect(state.comic).toEqual(UPDATED_COMIC);
    });
  });

  describe('update received for different comic', () => {
    const CURRENT_COMIC = COMIC_2;
    const OTHER_COMIC = COMIC_4;

    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: false, comic: CURRENT_COMIC },
        comicUpdated({ comic: OTHER_COMIC })
      );
    });

    it('does not affect the current comic', () => {
      expect(state.comic).toEqual(CURRENT_COMIC);
    });

    it('does not change the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    it('does not change the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('failure to update a single comic', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: true, saved: true },
        updateComicFailed()
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });
});
