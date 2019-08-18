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

import { MissingComicsPipe } from './missing-comics.pipe';
import { COMIC_1, COMIC_2, COMIC_3, COMIC_4 } from 'app/library';

describe('MissingComicsPipe', () => {
  const pipe = new MissingComicsPipe();
  const MISSING_COMIC = { ...COMIC_4, missing: true };
  const NO_MISSING_COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const WITH_MISSING_COMICS = [COMIC_1, COMIC_2, COMIC_3, MISSING_COMIC];
  const MISSING_COMICS = [MISSING_COMIC];

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty array if no comics are given', () => {
    expect(pipe.transform(null)).toEqual([]);
  });

  it('returns an empty array if an empty array is given', () => {
    expect(pipe.transform([])).toEqual([]);
  });

  it('returns an empty array if there are no missing comics', () => {
    expect(pipe.transform(NO_MISSING_COMICS)).toEqual([]);
  });

  it('returns only the missing comics when found', () => {
    expect(pipe.transform(WITH_MISSING_COMICS)).toEqual(MISSING_COMICS);
  });
});
