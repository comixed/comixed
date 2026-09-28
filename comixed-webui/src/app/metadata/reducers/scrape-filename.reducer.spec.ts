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
  initialScrapeFilenameState,
  scrapeFilenameReducer,
  ScrapeFilenameState
} from './scrape-filename.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { ScrapeFilenameActions } from '@app/metadata/actions/scrape-filename.actions';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('ScrapeFilename Reducer', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_NUMBER = '350';

  let state: ScrapeFilenameState;

  beforeEach(() => {
    state = { ...initialScrapeFilenameState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = scrapeFilenameReducer({ ...state }, {} as Action<string>);
    });

    it('should should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no series', () => {
      expect(state.series).toStrictEqual('');
    });

    it('should have no volume', () => {
      expect(state.volume).toStrictEqual('');
    });

    it('should have no issue number', () => {
      expect(state.issueNumber).toStrictEqual('');
    });
  });

  describe('scraping the filename of a comic', () => {
    beforeEach(() => {
      state = scrapeFilenameReducer(
        {
          ...state,
          busy: false
        },
        ScrapeFilenameActions.scrapeComic({ comic: TEST_COMIC })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = scrapeFilenameReducer(
          { ...state, busy: true, series: '', volume: '', issueNumber: '' },
          ScrapeFilenameActions.scrapeComicSuccess({
            series: TEST_SERIES,
            volume: TEST_VOLUME,
            issueNumber: TEST_ISSUE_NUMBER
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the series', () => {
        expect(state.series).toStrictEqual(TEST_SERIES);
      });

      it('should update the volume', () => {
        expect(state.volume).toStrictEqual(TEST_VOLUME);
      });

      it('should update the issue number', () => {
        expect(state.issueNumber).toStrictEqual(TEST_ISSUE_NUMBER);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = scrapeFilenameReducer(
          { ...state, busy: true },
          ScrapeFilenameActions.scrapeComicFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
