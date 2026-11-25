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
  filenameScrapingRuleListAdapter,
  filenameScrapingRuleListReducer,
  FilenameScrapingRuleListState,
  initialFilenameScrapingRuleListState
} from '../reducers/filename-scraping-rule-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { FilenameScrapingRuleListActions } from '@app/metadata/actions/filename-scraping-rule-list.actions';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2
} from '@app/metadata/metadata-fixtures';
import { DownloadDocument } from '@app/file-transfers/models/download-document';
import { EMPTY_FILENAME_SCRAPING_RULE } from '@app/metadata/models/filename-scraping-rule';

describe('FilenameScrapingRuleList Reducer', () => {
  const TEST_FILENAME_SCRAPING_RULE_LIST = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2
  ];
  const TEST_RULES_FILE = new File([], 'testing');
  const TEST_DOWNLOAD_FILE = {
    filename: 'rules.cxrules',
    mediaType: 'application/csv',
    content: 'the content'
  } as DownloadDocument;

  let state: FilenameScrapingRuleListState;

  beforeEach(() => {
    state = { ...initialFilenameScrapingRuleListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        { ...state },
        {} as Action<string>
      );
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no rules loaded', () => {
      expect(
        filenameScrapingRuleListAdapter.getSelectors().selectAll(state)
      ).toEqual([]);
    });
  });

  describe('adding a rule', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        filenameScrapingRuleListAdapter.setAll([], state),
        FilenameScrapingRuleListActions.addRule()
      );
    });

    it('should add an empty rule', () => {
      expect(
        filenameScrapingRuleListAdapter.getSelectors().selectAll(state)
      ).toEqual([EMPTY_FILENAME_SCRAPING_RULE]);
    });
  });

  describe('removing a rule', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        filenameScrapingRuleListAdapter.setAll(
          TEST_FILENAME_SCRAPING_RULE_LIST,
          state
        ),
        FilenameScrapingRuleListActions.removeRule({
          filenameScrapingRuleId:
            TEST_FILENAME_SCRAPING_RULE_LIST[0].filenameScrapingRuleId
        })
      );
    });

    it('should remove the rule', () => {
      expect(
        filenameScrapingRuleListAdapter.getSelectors().selectAll(state)
      ).not.toContain(TEST_FILENAME_SCRAPING_RULE_LIST[0]);
    });
  });

  describe('loading the rules', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        {
          ...state,
          busy: false
        },
        FilenameScrapingRuleListActions.loadFilenameRules()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.loadFilenameRulesSuccess({
            rules: TEST_FILENAME_SCRAPING_RULE_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of rules', () => {
        expect(
          filenameScrapingRuleListAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.loadFilenameRulesFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('saving the rules', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        {
          ...state,
          busy: false
        },
        FilenameScrapingRuleListActions.saveFilenameRules({
          rules: TEST_FILENAME_SCRAPING_RULE_LIST
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.saveFilenameRulesSuccess({
            rules: TEST_FILENAME_SCRAPING_RULE_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of rules', () => {
        expect(
          filenameScrapingRuleListAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.saveFilenameRulesFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('uploading the rules', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        {
          ...state,
          busy: false
        },
        FilenameScrapingRuleListActions.uploadFilenameRulesFile({
          file: TEST_RULES_FILE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.uploadFilenameRulesFileSuccess({
            rules: TEST_FILENAME_SCRAPING_RULE_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of rules', () => {
        expect(
          filenameScrapingRuleListAdapter.getSelectors().selectAll(state)
        ).toEqual(TEST_FILENAME_SCRAPING_RULE_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.uploadFilenameRulesFileFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('downloading the rules', () => {
    beforeEach(() => {
      state = filenameScrapingRuleListReducer(
        {
          ...state,
          busy: false
        },
        FilenameScrapingRuleListActions.downloadFilenameRulesFile()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.downloadFilenameRulesFileSuccess({
            document: TEST_DOWNLOAD_FILE
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = filenameScrapingRuleListReducer(
          filenameScrapingRuleListAdapter.setAll([], { ...state, busy: true }),
          FilenameScrapingRuleListActions.downloadFilenameRulesFileFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
