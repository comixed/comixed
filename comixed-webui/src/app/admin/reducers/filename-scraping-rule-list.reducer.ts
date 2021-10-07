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

import { createReducer, on } from '@ngrx/store';
import {
  filenameScrapingRulesLoaded,
  filenameScrapingRulesSaved,
  loadFilenameScrapingRules,
  loadFilenameScrapingRulesFailed,
  saveFilenameScrapingRules,
  saveFilenameScrapingRulesFailed
} from '../actions/filename-scraping-rule-list.actions';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';

export const FILENAME_SCRAPING_RULES_FEATURE_KEY =
  'filename_scraping_rules_state';

export interface FilenameScrapingRulesState {
  busy: boolean;
  rules: FilenameScrapingRule[];
}

export const initialState: FilenameScrapingRulesState = {
  busy: false,
  rules: []
};

export const reducer = createReducer(
  initialState,

  on(loadFilenameScrapingRules, state => ({ ...state, busy: true })),
  on(filenameScrapingRulesLoaded, (state, action) => ({
    ...state,
    busy: false,
    rules: action.rules
  })),
  on(loadFilenameScrapingRulesFailed, state => ({ ...state, busy: false })),
  on(saveFilenameScrapingRules, state => ({ ...state, busy: true })),
  on(filenameScrapingRulesSaved, (state, action) => ({
    ...state,
    busy: false,
    rules: action.rules
  })),
  on(saveFilenameScrapingRulesFailed, state => ({ ...state, busy: false }))
);
