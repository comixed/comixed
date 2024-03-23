/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { IssueMetadataTitlePipe } from './issue-metadata-title.pipe';
import {
  SCRAPING_ISSUE_1,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';

describe('IssueMetadataTitlePipe', () => {
  const ISSUE = SCRAPING_ISSUE_1;

  let pipe: IssueMetadataTitlePipe;

  beforeEach(() => {
    pipe = new IssueMetadataTitlePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('generates a title from an issue', () => {
    expect(pipe.transform(ISSUE)).toEqual(
      `${ISSUE.volumeName} #${ISSUE.issueNumber}`
    );
  });
});
