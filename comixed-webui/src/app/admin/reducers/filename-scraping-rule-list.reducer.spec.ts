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

import {
  FilenameScrapingRulesState,
  initialState,
  reducer
} from './filename-scraping-rule-list.reducer';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3
} from '@app/admin/admin.fixtures';
import {
  loadFilenameScrapingRules,
  loadFilenameScrapingRulesFailure,
  loadFilenameScrapingRulesSuccess,
  saveFilenameScrapingRules,
  saveFilenameScrapingRulesFailure,
  saveFilenameScrapingRulesSuccess
} from '@app/admin/actions/filename-scraping-rule-list.actions';

describe('FilenameScrapingRuleList Reducer', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];

  let state: FilenameScrapingRulesState;

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

    it('has no rules loaded', () => {
      expect(state.rules).toEqual([]);
    });
  });

  describe('loading filename scraping rules', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadFilenameScrapingRules());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false, rules: [] },
          loadFilenameScrapingRulesSuccess({ rules: RULES })
        );
      });

      it('sets the rules', () => {
        expect(state.rules).toEqual(RULES);
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          loadFilenameScrapingRulesFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('saving the rules', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        saveFilenameScrapingRules({ rules: RULES })
      );
    });

    it('sts the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('successful', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, rules: [] },
          saveFilenameScrapingRulesSuccess({ rules: RULES })
        );
      });

      it('sets the rules', () => {
        expect(state.rules).toEqual(RULES);
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          saveFilenameScrapingRulesFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
