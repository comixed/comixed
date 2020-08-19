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

import { Action, createReducer, on } from '@ngrx/store';
import {
  getScrapingIssue,
  getScrapingIssueFailed,
  scrapingIssueReceived
} from '../actions/scraping-issue.actions';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';

export const SCRAPING_ISSUE_FEATURE_KEY = 'scraping_issue_state';

export interface ScrapingIssueState {
  fetching: boolean;
  issue: ScrapingIssue;
}

export const initialState: ScrapingIssueState = {
  fetching: false,
  issue: null
};

const scrapingIssueReducer = createReducer(
  initialState,

  on(getScrapingIssue, state => ({ ...state, fetching: true })),
  on(scrapingIssueReceived, (state, action) => ({
    ...state,
    fetching: false,
    issue: action.issue
  })),
  on(getScrapingIssueFailed, state => ({
    ...state,
    fetching: false,
    issue: null
  }))
);

export function reducer(state: ScrapingIssueState | undefined, action: Action) {
  return scrapingIssueReducer(state, action);
}
