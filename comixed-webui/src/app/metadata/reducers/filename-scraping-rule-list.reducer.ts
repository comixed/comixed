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

import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import {
  EMPTY_FILENAME_SCRAPING_RULE,
  FilenameScrapingRule
} from '@app/metadata/models/filename-scraping-rule';
import { FilenameScrapingRuleListActions } from '@app/metadata/actions/filename-scraping-rule-list.actions';

export const FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY =
  'filename_scraping_rule_list_state';

export interface FilenameScrapingRuleListState extends EntityState<FilenameScrapingRule> {
  busy: boolean;
}

export const filenameScrapingRuleListAdapter: EntityAdapter<FilenameScrapingRule> =
  createEntityAdapter<FilenameScrapingRule>({
    selectId: rule => rule.filenameScrapingRuleId,
    sortComparer: (left, right) => left.priority - right.priority
  });

export const initialFilenameScrapingRuleListState: FilenameScrapingRuleListState =
  filenameScrapingRuleListAdapter.getInitialState({
    busy: false
  });

export const filenameScrapingRuleListReducer = createReducer(
  initialFilenameScrapingRuleListState,
  on(FilenameScrapingRuleListActions.addRule, state => {
    return filenameScrapingRuleListAdapter.addOne(
      EMPTY_FILENAME_SCRAPING_RULE,
      state
    );
  }),
  on(FilenameScrapingRuleListActions.removeRule, (state, action) => {
    return filenameScrapingRuleListAdapter.removeOne(
      action.filenameScrapingRuleId,
      state
    );
  }),
  on(FilenameScrapingRuleListActions.loadFilenameRules, state => ({
    ...state,
    busy: true
  })),
  on(
    FilenameScrapingRuleListActions.loadFilenameRulesSuccess,
    (state, action) => {
      return filenameScrapingRuleListAdapter.setAll(action.rules, {
        ...state,
        busy: false
      });
    }
  ),
  on(FilenameScrapingRuleListActions.loadFilenameRulesFailure, state => ({
    ...state,
    busy: false
  })),
  on(FilenameScrapingRuleListActions.saveFilenameRules, state => ({
    ...state,
    busy: true
  })),
  on(
    FilenameScrapingRuleListActions.saveFilenameRulesSuccess,
    (state, action) => {
      return filenameScrapingRuleListAdapter.setAll(action.rules, {
        ...state,
        busy: false
      });
    }
  ),
  on(FilenameScrapingRuleListActions.saveFilenameRulesFailure, state => ({
    ...state,
    busy: false
  })),
  on(FilenameScrapingRuleListActions.uploadFilenameRulesFile, state => ({
    ...state,
    busy: true
  })),
  on(
    FilenameScrapingRuleListActions.uploadFilenameRulesFileSuccess,
    (state, action) => {
      return filenameScrapingRuleListAdapter.setAll(action.rules, {
        ...state,
        busy: false
      });
    }
  ),
  on(FilenameScrapingRuleListActions.uploadFilenameRulesFileFailure, state => ({
    ...state,
    busy: false
  })),
  on(FilenameScrapingRuleListActions.downloadFilenameRulesFile, state => ({
    ...state,
    busy: true
  })),
  on(
    FilenameScrapingRuleListActions.downloadFilenameRulesFileSuccess,
    state => ({ ...state, busy: false })
  ),
  on(
    FilenameScrapingRuleListActions.downloadFilenameRulesFileFailure,
    state => ({ ...state, busy: false })
  )
);

export const filenameScrapingRuleListsFeature = createFeature({
  name: FILENAME_SCRAPING_RULE_LIST_FEATURE_KEY,
  reducer: filenameScrapingRuleListReducer
});
