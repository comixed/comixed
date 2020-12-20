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

import { MatchabilityPipe } from './matchability.pipe';
import {
  EXACT_MATCH,
  EXACT_MATCH_TEXT,
  NEAR_MATCH,
  NEAR_MATCH_TEXT,
  NO_MATCH,
  NO_MATCH_TEXT
} from '@app/library/components/comic-scraping/comic-scraping.component';

describe('MatchabilityPipe', () => {
  let pipe: MatchabilityPipe;

  beforeEach(() => {
    pipe = new MatchabilityPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('handles an exact match', () => {
    expect(pipe.transform(EXACT_MATCH)).toEqual(EXACT_MATCH_TEXT);
  });

  it('handles a near match', () => {
    expect(pipe.transform(NEAR_MATCH)).toEqual(NEAR_MATCH_TEXT);
  });

  it('handles a non match', () => {
    expect(pipe.transform(NO_MATCH)).toEqual(NO_MATCH_TEXT);
  });
});
