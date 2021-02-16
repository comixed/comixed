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

import { BlockedPageUrlPipe } from './blocked-page-url.pipe';
import { PAGE_2 } from '@app/library/library.fixtures';
import { BLOCKED_PAGE_URL } from '@app/blocked-page/blocked-page.constants';
import { interpolate } from '@app/core';

describe('BlockedPageUrlPipe', () => {
  const HASH = PAGE_2.hash;

  let pipe: BlockedPageUrlPipe;

  beforeEach(() => {
    pipe = new BlockedPageUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns a URL for a blocked page', () => {
    expect(pipe.transform(HASH)).toEqual(
      interpolate(BLOCKED_PAGE_URL, { hash: HASH })
    );
  });
});
