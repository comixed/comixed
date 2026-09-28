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
  comicRemovalReducer,
  ComicRemovalState,
  initialComicRemovalState
} from './comic-removal.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { ComicRemovalActions } from '@app/library/actions/comic-removal.actions';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('ComicRemoval Reducer', () => {
  const TEST_COMIC = COMIC_1;

  let state: ComicRemovalState;

  beforeEach(() => {
    state = { ...initialComicRemovalState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = comicRemovalReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('marking a single comic for removal', () => {
    beforeEach(() => {
      state = comicRemovalReducer(
        {
          ...state,
          busy: false
        },
        ComicRemovalActions.markOneForRemoval({ comic: TEST_COMIC })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.markOneForRemovalSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.markOneForRemovalFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('unmarking a single comic for removal', () => {
    beforeEach(() => {
      state = comicRemovalReducer(
        {
          ...state,
          busy: false
        },
        ComicRemovalActions.unmarkOneForRemoval({ comic: TEST_COMIC })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.unmarkOneForRemovalSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.unmarkOneForRemovalFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('marking selected comics for removal', () => {
    beforeEach(() => {
      state = comicRemovalReducer(
        {
          ...state,
          busy: false
        },
        ComicRemovalActions.markSelectionsForRemoval()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.markSelectionsForRemovalSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.markSelectionsForRemovalFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('unmarking selected comics for removal', () => {
    beforeEach(() => {
      state = comicRemovalReducer(
        {
          ...state,
          busy: false
        },
        ComicRemovalActions.unmarkSelectionsForRemoval()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.unmarkSelectionsForRemovalSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = comicRemovalReducer(
          { ...state, busy: true },
          ComicRemovalActions.unmarkSelectionsForRemovalFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
