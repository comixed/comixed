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

import { beforeEach } from 'vitest';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2
} from '@app/metadata/metadata-fixtures';
import {
  selectFilenameScrapingRuleListBusy,
  selectFilenameScrapingRuleListEntries
} from '@app/metadata/selectors/filename-scraping-rule-list.selectors';
import {
  FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY,
  filenameScrapingRuleListAdapter,
  FilenameScrapingRuleListState,
  initialFilenameScrapingRuleListState
} from '@app/metadata/reducers/filename-scraping-rule-list.reducer';

describe('FilenameScrapingRuleList Selectors', () => {
  const TEST_FILENAME_SCRAPING_RULE_LIST = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2
  ];

  let state: FilenameScrapingRuleListState;

  beforeEach(() => {
    state = filenameScrapingRuleListAdapter.setAll(
      TEST_FILENAME_SCRAPING_RULE_LIST,
      {
        ...initialFilenameScrapingRuleListState,
        busy: false
      }
    );
  });

  describe('selecting the busy flag', () => {
    it('returns false when busy', () => {
      expect(
        selectFilenameScrapingRuleListBusy({
          [FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when busy', () => {
      expect(
        selectFilenameScrapingRuleListBusy({
          [FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the filename scraping rule list', () => {
    expect(
      selectFilenameScrapingRuleListEntries({
        [FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_FILENAME_SCRAPING_RULE_LIST);
  });
});
