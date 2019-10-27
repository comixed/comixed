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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ComicFilterPipe } from './comic-filter.pipe';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from 'app/comics/models/comic.fixtures';
import { Comic } from 'app/comics';
import { LibraryFilter } from 'app/library/models/library-filter';

describe('ComicFilterPipe', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];
  const FILTERS: LibraryFilter = {
    publisher: null,
    series: null
  };

  let pipe: ComicFilterPipe;

  beforeEach(() => {
    pipe = new ComicFilterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty array if no comics are provided', () => {
    expect(pipe.transform(null, FILTERS)).toEqual([]);
  });

  describe('filtering by publisher', () => {
    const PUBLISHER = COMIC_2.publisher;
    let result: Comic[];

    beforeEach(() => {
      result = pipe.transform(COMICS, {
        ...FILTERS,
        publisher: PUBLISHER
      });
    });

    it('returns a non-empty array', () => {
      expect(result.length).toBeGreaterThan(0);
    });

    it('only returns comics with the given publisher', () => {
      result.every(comic => expect(comic.publisher).toEqual(PUBLISHER));
    });
  });

  describe('filtering by series', () => {
    const SERIES = COMIC_2.series;
    let result: Comic[];

    beforeEach(() => {
      result = pipe.transform(COMICS, {
        ...FILTERS,
        series: SERIES
      });
    });

    it('returns a non-empty array', () => {
      expect(result.length).toBeGreaterThan(0);
    });

    it('only returns comics with the given series', () => {
      result.forEach((comic: Comic) => expect(comic.series).toEqual(SERIES));
    });
  });
});
