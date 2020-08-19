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

import {
  SCRAPING_ISSUE_FEATURE_KEY,
  ScrapingIssueState
} from '../reducers/scraping-issue.reducer';
import {
  selectScrapingIssue,
  selectScrapingIssuesFetching,
  selectScrapingIssuesState
} from './scraping-issue.selectors';
import { SCRAPING_ISSUE_1000 } from 'app/comics/comics.fixtures';

describe('ScrapingIssue Selectors', () => {
  const ISSUE = SCRAPING_ISSUE_1000;

  let state: ScrapingIssueState;

  beforeEach(() => {
    state = {
      fetching: Math.random() * 100 > 50,
      issue: ISSUE
    } as ScrapingIssueState;
  });

  it('should select the feature state', () => {
    expect(
      selectScrapingIssuesState({
        [SCRAPING_ISSUE_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the fetching flag', () => {
    expect(
      selectScrapingIssuesFetching({ [SCRAPING_ISSUE_FEATURE_KEY]: state })
    ).toEqual(state.fetching);
  });

  it('should select the issue', () => {
    expect(
      selectScrapingIssue({ [SCRAPING_ISSUE_FEATURE_KEY]: state })
    ).toEqual(state.issue);
  });
});
