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
  FILENAME_SCRAPING_RULES_FEATURE_KEY,
  FilenameScrapingRulesState
} from '../reducers/filename-scraping-rule-list.reducer';
import {
  selectFilenameScrapingRules,
  selectFilenameScrapingRulesState
} from './filename-scraping-rule-list.selectors';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3
} from '@app/admin/admin.fixtures';

describe('FilenameScrapingRuleList Selectors', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];

  let state: FilenameScrapingRulesState;

  beforeEach(() => {
    state = { busy: Math.random() > 0.5, rules: RULES };
  });

  it('should select the feature state', () => {
    expect(
      selectFilenameScrapingRulesState({
        [FILENAME_SCRAPING_RULES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the filename scraping rules', () => {
    expect(
      selectFilenameScrapingRules({
        [FILENAME_SCRAPING_RULES_FEATURE_KEY]: state
      })
    ).toEqual(state.rules);
  });
});
