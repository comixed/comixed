/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromScrapingIssues from '../reducers/scraping-issue.reducer';
import { ScrapingIssueState } from '../reducers/scraping-issue.reducer';

/**
 * Returns the feature state.
 */
export const selectScrapingIssuesState = createFeatureSelector<
  ScrapingIssueState
>(fromScrapingIssues.SCRAPING_ISSUE_FEATURE_KEY);

/**
 * Returns the fetching issue flag.
 */
export const selectScrapingIssuesFetching = createSelector(
  selectScrapingIssuesState,
  state => state.fetching
);

/**
 * Returns the current scraping issue.
 */
export const selectScrapingIssue = createSelector(
  selectScrapingIssuesState,
  state => state.issue
);
