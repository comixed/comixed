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
import { FilterState } from 'app/library/reducers/filters.reducer';
import { Comic } from 'app/comics';

describe('ComicFilterPipe', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];
  const FILTERS: FilterState = {
    publisher: null,
    series: null,
    volume: null,
    earliestYearPublished: null,
    latestYearPublished: null
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

  describe('filtering by volume', () => {
    const VOLUME = COMIC_2.volume;
    let result: Comic[];

    beforeEach(() => {
      result = pipe.transform(COMICS, {
        ...FILTERS,
        volume: VOLUME
      });
    });

    it('returns a non-empty array', () => {
      expect(result.length).toBeGreaterThan(0);
    });

    it('only returns comics with the given volume', () => {
      result.forEach((comic: Comic) => expect(comic.volume).toEqual(VOLUME));
    });
  });

  describe('filtering by earliest cover year', () => {
    const YEAR = COMIC_3.yearPublished;
    let result: Comic[];

    beforeEach(() => {
      result = pipe.transform(COMICS, {
        ...FILTERS,
        earliestYearPublished: YEAR
      });
    });

    it('returns a non-empty array', () => {
      expect(result.length).toBeGreaterThan(0);
    });

    it('only returns comics publisher on or after the given year', () => {
      result.forEach((comic: Comic) =>
        expect(comic.yearPublished).toBeGreaterThanOrEqual(YEAR)
      );
    });
  });

  describe('filtering by latest cover year', () => {
    const YEAR = COMIC_3.yearPublished;
    let result: Comic[];

    beforeEach(() => {
      result = pipe.transform(COMICS, {
        ...FILTERS,
        latestYearPublished: YEAR
      });
    });

    it('returns a non-empty array', () => {
      expect(result.length).toBeGreaterThan(0);
    });

    it('only returns comics publisher on or before the given year', () => {
      result.forEach((comic: Comic) =>
        expect(comic.yearPublished).toBeLessThanOrEqual(YEAR)
      );
    });
  });
});
