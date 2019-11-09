/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { ScrapingIssueCoverUrlPipe } from './scraping-issue-cover-url.pipe';
import { SCRAPING_ISSUE_1000 } from 'app/comics/models/scraping-issue.fixtures';

describe('ScrapingIssueCoverUrlPipe', () => {
  const API_KEY = '0123456789ABCDEF';
  const ISSUE = SCRAPING_ISSUE_1000;

  let pipe: ScrapingIssueCoverUrlPipe;

  beforeEach(() => {
    pipe = new ScrapingIssueCoverUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty URL for a null issue', () => {
    expect(pipe.transform(null, API_KEY)).toEqual('');
  });

  it('returns an empty URL when no API key is provided', () => {
    expect(pipe.transform(ISSUE, null)).toEqual('');
  });

  it('returns a URL for an issue', () => {
    expect(pipe.transform(ISSUE, API_KEY)).toEqual(
      `${ISSUE.coverUrl}?api_key=${API_KEY}`
    );
  });
});
