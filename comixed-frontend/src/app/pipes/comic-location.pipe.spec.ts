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

import { ComicLocationPipe } from './comic-location.pipe';
import {
  COMIC_1000,
  COMIC_1001,
  COMIC_1002
} from 'app/models/comics/comic.fixtures';

describe('ComicLocationPipe', () => {
  const pipe = new ComicLocationPipe();
  const library = [COMIC_1000, COMIC_1001, COMIC_1002];

  it('returns an empty array if given a null reference', () => {
    expect(pipe.transform(null, '')).toEqual([]);
  });

  it('returns the supplied array if the location is null', () => {
    expect(pipe.transform(library, null)).toEqual(library);
  });

  it('return the supplied array if the location is empty', () => {
    expect(pipe.transform(library, '')).toEqual(library);
  });

  it('returns an empty array if no comics have the given location', () => {
    expect(pipe.transform(library, 'DOESNOTEXIST')).toEqual([]);
  });

  it('returns an array of just the comics with the given location', () => {
    expect(pipe.transform(library, 'LOCATION1')).toEqual([COMIC_1000]);
    expect(pipe.transform(library, 'LOCATION2')).toEqual([
      COMIC_1000,
      COMIC_1002
    ]);
  });
});
