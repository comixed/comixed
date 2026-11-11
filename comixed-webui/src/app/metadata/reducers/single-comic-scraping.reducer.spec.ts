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
  initialSingleComicScrapingState,
  singleComicScrapingAdapter,
  singleComicScrapingReducer,
  SingleComicScrapingState
} from './single-comic-scraping.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import {
  METADATA_SOURCE_1,
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2
} from '@app/metadata/metadata-fixtures';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('SingleComicScraping Reducer', () => {
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_MATCH_PUBLISHER = Math.random() > 0.5;
  const TEST_SKIP_CACHE = Math.random() > 0.5;
  const TEST_MAX_RECORDS = 0;
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_SCRAPING_VOLUME_LIST = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2];
  const TEST_SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const TEST_ISSUE_ID = TEST_SCRAPING_ISSUE.id;
  const TEST_COMIC = COMIC_1;

  let state: SingleComicScrapingState;

  beforeEach(() => {
    state = { ...initialSingleComicScrapingState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = singleComicScrapingReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should not have a scraping issue', () => {
      expect(state.issue).toBeNull();
    });
  });

  describe('resetting the scraping volume list', () => {
    beforeEach(() => {
      state = singleComicScrapingReducer(
        singleComicScrapingAdapter.setAll(TEST_SCRAPING_VOLUME_LIST, {
          ...initialSingleComicScrapingState,
          issue: TEST_SCRAPING_ISSUE
        }),
        SingleComicScrapingActions.resetVolumes()
      );
    });

    it('should clear the list of scraping volumes', () => {
      expect(
        singleComicScrapingAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });

    it('should clear the  scraping issue', () => {
      expect(state.issue).toBeNull();
    });
  });

  describe('loading scraping volumes', () => {
    beforeEach(() => {
      state = singleComicScrapingReducer(
        { ...state, busy: false },
        SingleComicScrapingActions.loadVolumes({
          metadataSource: TEST_METADATA_SOURCE,
          publisher: TEST_PUBLISHER,
          series: TEST_SERIES,
          matchPublisher: TEST_MATCH_PUBLISHER,
          maximumRecords: TEST_MAX_RECORDS,
          skipCache: TEST_SKIP_CACHE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          singleComicScrapingAdapter.setAll([], {
            ...state,
            busy: true
          }),
          SingleComicScrapingActions.loadVolumesSuccess({
            volumes: TEST_SCRAPING_VOLUME_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the volume list', () => {
        expect(
          singleComicScrapingAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_SCRAPING_VOLUME_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          singleComicScrapingAdapter.setAll([], {
            ...state,
            busy: true
          }),
          SingleComicScrapingActions.loadVolumesFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('loading a scraping issue', () => {
    beforeEach(() => {
      state = singleComicScrapingReducer(
        { ...state, busy: false },
        SingleComicScrapingActions.loadIssue({
          metadataSource: TEST_METADATA_SOURCE,
          volumeId: TEST_SCRAPING_VOLUME_LIST[0].id,
          issueNumber: '717',
          skipCache: TEST_SKIP_CACHE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success, issue found', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          {
            ...state,
            busy: true,
            issue: null
          },
          SingleComicScrapingActions.loadIssueSuccess({
            issue: TEST_SCRAPING_ISSUE
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the scraping issue', () => {
        expect(state.issue).toStrictEqual(TEST_SCRAPING_ISSUE);
      });
    });

    describe('success, no issue found', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          {
            ...state,
            busy: true,
            issue: TEST_SCRAPING_ISSUE
          },
          SingleComicScrapingActions.loadIssueSuccess({
            issue: null
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should clear the scraping issue', () => {
        expect(state.issue).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          {
            ...state,
            busy: true
          },
          SingleComicScrapingActions.loadIssueFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('scraping a single comic', () => {
    beforeEach(() => {
      state = singleComicScrapingReducer(
        { ...state, busy: false },
        SingleComicScrapingActions.scrapeComic({
          metadataSource: TEST_METADATA_SOURCE,
          issueId: TEST_ISSUE_ID,
          comic: TEST_COMIC,
          skipCache: TEST_SKIP_CACHE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          singleComicScrapingAdapter.setAll(TEST_SCRAPING_VOLUME_LIST, {
            ...state,
            busy: true,
            issue: TEST_SCRAPING_ISSUE
          }),
          SingleComicScrapingActions.scrapeComicSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should clear the list of scraping volumes', () => {
        expect(
          singleComicScrapingAdapter.getSelectors().selectAll(state)
        ).toStrictEqual([]);
      });

      it('should clear the scraping issue', () => {
        expect(state.issue).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = singleComicScrapingReducer(
          { ...state, busy: true },
          SingleComicScrapingActions.scrapeComicFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
