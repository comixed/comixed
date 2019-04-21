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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ScrapingIssueTitlePipe } from './scraping-issue-title.pipe';
import { VOLUME_1000 } from 'app/models/comics/volume.fixtures';
import { ISSUE_1000 } from 'app/models/scraping/issue.fixtures';

describe('ScrapingIssueTitlePipe', () => {
  const pipe = new ScrapingIssueTitlePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty string when the volume is null', () => {
    expect(pipe.transform(null)).toEqual('');
  });

  it('returns a well formatted title', () => {
    const issue = ISSUE_1000;
    expect(pipe.transform(issue)).toEqual(
      `${issue.volume_name} #${issue.issue_number} (${new Date(
        issue.cover_date
      ).getFullYear()})`
    );
  });
});
