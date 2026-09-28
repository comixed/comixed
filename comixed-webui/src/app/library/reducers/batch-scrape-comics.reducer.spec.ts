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
  batchScrapeComicsReducer,
  BatchScrapeComicsState,
  initialBatchScrapeComicsState
} from './batch-scrape-comics.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { BatchScrapeComicsActions } from '@app/library/actions/batch-scrape-comics.actions';

describe('BatchScrapeComics Reducer', () => {
  let state: BatchScrapeComicsState;

  beforeEach(() => {
    state = { ...initialBatchScrapeComicsState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = batchScrapeComicsReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });
  });

  describe('starting batch scraping', () => {
    beforeEach(() => {
      state = batchScrapeComicsReducer(
        { ...state, busy: false },
        BatchScrapeComicsActions.startBatchScraping()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = batchScrapeComicsReducer(
          {
            ...state,
            busy: true
          },
          BatchScrapeComicsActions.startBatchScrapingSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = batchScrapeComicsReducer(
          {
            ...state,
            busy: true
          },
          BatchScrapeComicsActions.startBatchScrapingFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
