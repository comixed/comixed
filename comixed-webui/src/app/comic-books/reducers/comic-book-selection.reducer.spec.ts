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
  ComicBookSelectionState,
  initialState,
  reducer
} from './comic-book-selection.reducer';
import {
  addSingleComicBookSelection,
  clearComicBookSelectionState,
  clearComicBookSelectionStateFailed,
  comicBookSelectionsLoaded,
  comicBookSelectionStateCleared,
  comicBookSelectionUpdate,
  loadComicBookSelections,
  loadComicBookSelectionsFailed,
  removeSingleComicBookSelection,
  setMultipleComicBookByFilterSelectionState,
  setMultipleComicBookByIdSelectionState,
  setMultipleComicBooksByTagTypeAndValueSelectionState,
  setMultipleComicBookSelectionStateFailure,
  setMultipleComicBookSelectionStateSuccess,
  singleComicBookSelectionFailed,
  singleComicBookSelectionUpdated
} from '@app/comic-books/actions/comic-book-selection.actions';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { TagType } from '@app/collections/models/comic-collection.enum';

describe('ComicBookSelection Reducer', () => {
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const READ_STATE = Math.random() > 0.5;
  const UNSCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const COMIC_BOOKS = [
    COMIC_BOOK_1,
    COMIC_BOOK_2,
    COMIC_BOOK_3,
    COMIC_BOOK_4,
    COMIC_BOOK_5
  ];
  const TAG_TYPE = TagType.TEAMS;
  const TAG_VALUE = 'Some team';
  const IDS = COMIC_BOOKS.map(comicBook => comicBook.id);
  const SELECTED = Math.random() > 0.5;

  let state: ComicBookSelectionState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no ids', () => {
      expect(state.ids).toEqual([]);
    });
  });

  describe('loading the initial set of comic book selections', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadComicBookSelections());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, ids: [] },
          comicBookSelectionsLoaded({ ids: IDS })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the id list', () => {
        expect(state.ids).toEqual(IDS);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          loadComicBookSelectionsFailed()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('receiving a comic book selection update', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, ids: IDS.map(id => id * 2) },
        comicBookSelectionUpdate({ ids: IDS })
      );
    });

    it('sets the id state', () => {
      expect(state.ids).toEqual(IDS);
    });
  });

  describe('clearing the comic book selection state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        clearComicBookSelectionState()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, ids: IDS, busy: true },
          comicBookSelectionStateCleared()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, ids: IDS, busy: true },
          clearComicBookSelectionStateFailed()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('adding a single comic book selection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        addSingleComicBookSelection({
          comicBookId: IDS[0]
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state }, singleComicBookSelectionUpdated());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state }, singleComicBookSelectionFailed());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('removing a single comic book selection', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        removeSingleComicBookSelection({
          comicBookId: IDS[0]
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state }, singleComicBookSelectionUpdated());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state }, singleComicBookSelectionFailed());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('set the selection state for multiple comic books', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        setMultipleComicBookByFilterSelectionState({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('set the selection state for comic books by tag type and value', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        setMultipleComicBooksByTagTypeAndValueSelectionState({
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          selected: SELECTED
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('set the selection state for comic books by id', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        setMultipleComicBookByIdSelectionState({
          selected: SELECTED,
          comicBookIds: IDS
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true },
        setMultipleComicBookSelectionStateSuccess()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('failure', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true },
        setMultipleComicBookSelectionStateFailure()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
