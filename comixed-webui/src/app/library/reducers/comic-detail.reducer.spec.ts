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
  comicDetailReducer,
  ComicDetailState,
  initialComicDetailState
} from '../reducers/comic-detail.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import {
  COMIC_1,
  COMIC_PAGE_1,
  COMIC_TAG_1,
  METADATA_1
} from '@app/library/library-fixtures';
import { ComicDetailAction } from '@app/library/actions/comic-detail.actions';
import { NO_COMIC } from '@app/library/models/comic';

describe('ComicDetail Reducer', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_PAGES = [COMIC_PAGE_1];
  const TEST_TAGS = [COMIC_TAG_1];
  const TEST_METADATA = METADATA_1;

  let state: ComicDetailState;

  beforeEach(() => {
    state = { ...initialComicDetailState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = comicDetailReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have NO_COMIC', () => {
      expect(state.comic).toStrictEqual(NO_COMIC);
    });

    it('should not have any pages', () => {
      expect(state.pages).toStrictEqual([]);
    });

    it('should not have any tags', () => {
      expect(state.tags).toStrictEqual([]);
    });

    it('should not have any metadata', () => {
      expect(state.metadata).toBeNull();
    });
  });

  describe('loading a comic', () => {
    beforeEach(() => {
      state = comicDetailReducer(
        {
          ...state,
          busy: false,
          comic: TEST_COMIC,
          pages: TEST_PAGES,
          tags: TEST_TAGS,
          metadata: TEST_METADATA
        },
        ComicDetailAction.load({ comicId: TEST_COMIC.comicId })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('resets the detail', () => {
      expect(state.comic).toStrictEqual(NO_COMIC);
    });

    it('clears the pages', () => {
      expect(state.pages).toStrictEqual([]);
    });

    it('clears the tags', () => {
      expect(state.tags).toStrictEqual([]);
    });

    it('clears the metadata', () => {
      expect(state.metadata).toBeNull();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicDetailReducer(
          {
            ...state,
            busy: true,
            comic: NO_COMIC,
            pages: [],
            tags: [],
            metadata: null
          },
          ComicDetailAction.loadSuccess({
            comic: TEST_COMIC,
            pages: TEST_PAGES,
            tags: TEST_TAGS,
            metadata: TEST_METADATA
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('sets the detail', () => {
        expect(state.comic).toStrictEqual(TEST_COMIC);
      });

      it('sets the pages', () => {
        expect(state.pages).toStrictEqual(TEST_PAGES);
      });

      it('sets the tags', () => {
        expect(state.tags).toStrictEqual(TEST_TAGS);
      });

      it('sets the metadata', () => {
        expect(state.metadata).toStrictEqual(TEST_METADATA);
      });
    });

    describe('receiving a comic update', () => {
      beforeEach(() => {
        state = comicDetailReducer(
          {
            ...state,
            busy: true,
            comic: NO_COMIC,
            pages: [],
            tags: [],
            metadata: null
          },
          ComicDetailAction.updateReceived({
            comic: TEST_COMIC,
            pages: TEST_PAGES,
            tags: TEST_TAGS,
            metadata: TEST_METADATA
          })
        );
      });

      it('sets the detail', () => {
        expect(state.comic).toStrictEqual(TEST_COMIC);
      });

      it('sets the pages', () => {
        expect(state.pages).toStrictEqual(TEST_PAGES);
      });

      it('sets the tags', () => {
        expect(state.tags).toStrictEqual(TEST_TAGS);
      });

      it('sets the metadata', () => {
        expect(state.metadata).toStrictEqual(TEST_METADATA);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicDetailReducer(
          {
            ...state,
            busy: true,
            comic: NO_COMIC,
            pages: [],
            tags: [],
            metadata: null
          },
          ComicDetailAction.loadFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('keeps the detail', () => {
        expect(state.comic).toStrictEqual(NO_COMIC);
      });

      it('keeps the pages empty', () => {
        expect(state.pages).toStrictEqual([]);
      });

      it('keeps the tags empty', () => {
        expect(state.tags).toStrictEqual([]);
      });

      it('keeps the metadata null', () => {
        expect(state.metadata).toBeNull();
      });
    });
  });

  describe('updating a comic', () => {
    beforeEach(() => {
      state = comicDetailReducer(
        { ...state, busy: false },
        ComicDetailAction.save({ comic: TEST_COMIC })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicDetailReducer(
          { ...state, busy: true },
          ComicDetailAction.saveSuccess()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicDetailReducer(
          { ...state, busy: true },
          ComicDetailAction.saveFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
