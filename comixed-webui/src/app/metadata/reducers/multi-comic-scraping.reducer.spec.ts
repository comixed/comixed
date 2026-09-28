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
  initialMultiComicScrapingState,
  multiComicScrapingAdapter,
  multiComicScrapingReducer,
  MultiComicScrapingState
} from '../reducers/multi-comic-scraping.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { MultiComicScrapingActions } from '@app/metadata/actions/multi-comic-scraping.actions';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';
import { METADATA_SOURCE_1 } from '@app/metadata/metadata-fixtures';

describe('MultiComicScraping Reducer', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_OTHER_COMIC = COMIC_2;
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_TOTAL = 417;
  const TEST_INDEX = 1;
  const TEST_SIZE = 10;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_ISSUE_ID = 'OICU812';
  const TEST_SKIP_CACHE = Math.random() > 0.5;

  let state: MultiComicScrapingState;

  beforeEach(() => {
    state = { ...initialMultiComicScrapingState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = multiComicScrapingReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy state', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no total', () => {
      expect(state.total).toBe(0);
    });

    it('should have no current comic', () => {
      expect(state.current).toBeNull();
    });
  });

  describe('starting multi-comic scraping', () => {
    beforeEach(() => {
      state = multiComicScrapingReducer(
        {
          ...state,
          busy: false
        },
        MultiComicScrapingActions.startScraping({ size: TEST_SIZE })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          multiComicScrapingAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0,
            current: TEST_COMIC
          }),
          MultiComicScrapingActions.startScrapingSuccess({
            entries: TEST_COMIC_LIST,
            total: TEST_TOTAL,
            index: TEST_INDEX,
            size: TEST_SIZE
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of comics', () => {
        expect(
          multiComicScrapingAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_COMIC_LIST);
      });

      it('should set the total', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });

      it('should clear the current comic', () => {
        expect(state.current).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          {
            ...state,
            busy: true
          },
          MultiComicScrapingActions.startScrapingFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('loading multi-comic entries', () => {
    beforeEach(() => {
      state = multiComicScrapingReducer(
        {
          ...state,
          busy: false
        },
        MultiComicScrapingActions.loadComics({
          index: TEST_INDEX,
          size: TEST_SIZE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          multiComicScrapingAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0,
            current: TEST_COMIC
          }),
          MultiComicScrapingActions.loadComicsSuccess({
            entries: TEST_COMIC_LIST,
            total: TEST_TOTAL,
            index: TEST_INDEX,
            size: TEST_SIZE
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of comics', () => {
        expect(
          multiComicScrapingAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_COMIC_LIST);
      });

      it('should set the total', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });

      it('should not set the current comic', () => {
        expect(state.current).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          {
            ...state,
            busy: true
          },
          MultiComicScrapingActions.loadComicsFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('the current comic', () => {
    describe('setting it', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          {
            ...state,
            current: null
          },
          MultiComicScrapingActions.setCurrentComic({ entry: TEST_COMIC })
        );
      });

      it('should set the current comic', () => {
        expect(state.current).toStrictEqual(TEST_COMIC);
      });
    });

    describe('replacing it', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          {
            ...state,
            current: TEST_COMIC
          },
          MultiComicScrapingActions.setCurrentComic({ entry: TEST_OTHER_COMIC })
        );
      });

      it('should set the current comic', () => {
        expect(state.current).toStrictEqual(TEST_OTHER_COMIC);
      });
    });
  });

  describe('removing a multi-comic entry', () => {
    beforeEach(() => {
      state = multiComicScrapingReducer(
        {
          ...state,
          busy: false
        },
        MultiComicScrapingActions.removeComic({ entry: TEST_COMIC })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          multiComicScrapingAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0,
            current: TEST_COMIC
          }),
          MultiComicScrapingActions.removeComicSuccess({
            entries: TEST_COMIC_LIST,
            total: TEST_TOTAL,
            index: TEST_INDEX,
            size: TEST_SIZE
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of comics', () => {
        expect(
          multiComicScrapingAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_COMIC_LIST);
      });

      it('should set the total', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });

      it('should not the current comic', () => {
        expect(state.current).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          {
            ...state,
            busy: true
          },
          MultiComicScrapingActions.removeComicFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('scraping a multi-comic entry', () => {
    beforeEach(() => {
      state = multiComicScrapingReducer(
        {
          ...state,
          busy: false
        },
        MultiComicScrapingActions.scrapeComic({
          metadataSource: TEST_METADATA_SOURCE,
          issueId: TEST_ISSUE_ID,
          comic: TEST_COMIC,
          skipCache: TEST_SKIP_CACHE,
          index: TEST_INDEX,
          size: TEST_SIZE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          multiComicScrapingAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0,
            current: TEST_COMIC
          }),
          MultiComicScrapingActions.scrapeComicSuccess({
            entries: TEST_COMIC_LIST,
            total: TEST_TOTAL,
            index: TEST_INDEX,
            size: TEST_SIZE
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of comics', () => {
        expect(
          multiComicScrapingAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_COMIC_LIST);
      });

      it('should set the total', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });

      it('should set the current comic', () => {
        expect(state.current).toStrictEqual(TEST_COMIC_LIST[0]);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = multiComicScrapingReducer(
          {
            ...state,
            busy: true
          },
          MultiComicScrapingActions.scrapeComicFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
