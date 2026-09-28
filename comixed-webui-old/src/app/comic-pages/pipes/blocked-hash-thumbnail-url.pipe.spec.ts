/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { BlockedHashThumbnailUrlPipe } from './blocked-hash-thumbnail-url.pipe';
import { API_ROOT_URL } from '@app/core';

describe('BlockedHashThumbnailUrlPipe', () => {
  const HASH = 'ABCDEF0123456789';
  const EXPECTED_HASH = `${API_ROOT_URL}/pages/blocked/${HASH}/content`;

  let pipe: BlockedHashThumbnailUrlPipe;

  beforeEach(() => {
    pipe = new BlockedHashThumbnailUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('generates a url from a blocked page hash', () => {
    expect(pipe.transform(HASH)).toEqual(EXPECTED_HASH);
  });
});
