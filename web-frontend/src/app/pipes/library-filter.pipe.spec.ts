/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { LibraryFilterPipe } from "./library-filter.pipe";
import { LibraryFilter } from "../models/actions/library-filter";
import { Comic } from "../models/comics/comic";
import {
  COMIC_1000,
  COMIC_1001,
  COMIC_1002,
  COMIC_1003
} from "../models/comics/comic.fixtures";

fdescribe("LibraryFilterPipe", () => {
  let pipe: LibraryFilterPipe;
  const comics = [COMIC_1000, COMIC_1001, COMIC_1002, COMIC_1003];

  beforeEach(() => {
    pipe = new LibraryFilterPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  describe("#transform()", () => {
    it("returns an empty array if there are no comics", () => {
      expect(pipe.transform(null, null)).toEqual([]);
    });

    it("returns those comics if there is no filter provided", () => {
      expect(pipe.transform(comics, null)).toEqual(comics);
    });

    it("returns those comics if the filters are all empty", () => {
      expect(
        pipe.transform(comics, {
          changed: false,
          publisher: "",
          series: "",
          volume: "",
          from_year: null,
          to_year: null
        })
      ).toEqual(comics);
    });

    it("returns only comics for the publisher if entered", () => {
      const result = pipe.transform(comics, {
        changed: false,
        publisher: COMIC_1000.publisher,
        series: "",
        volume: "",
        from_year: null,
        to_year: null
      });
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((comic: Comic) =>
        expect(comic.publisher).toEqual(COMIC_1000.publisher)
      );
    });

    it("returns only those comics for the series if entered", () => {
      const result = pipe.transform(comics, {
        changed: false,
        publisher: "",
        series: COMIC_1000.series,
        volume: "",
        from_year: null,
        to_year: null
      });
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((comic: Comic) =>
        expect(comic.series).toEqual(COMIC_1000.series)
      );
    });

    it("returns only those comics for the volume if entered", () => {
      const result = pipe.transform(comics, {
        changed: false,
        publisher: "",
        series: "",
        volume: COMIC_1000.volume,
        from_year: null,
        to_year: null
      });
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((comic: Comic) =>
        expect(comic.volume).toEqual(COMIC_1000.volume)
      );
    });

    it("returns only those comics published on or after the given start year", () => {
      const filter_date = new Date(Date.parse(COMIC_1000.cover_date));
      const result = pipe.transform(comics, {
        changed: false,
        publisher: "",
        series: "",
        volume: "",
        from_year: filter_date.getFullYear(),
        to_year: null
      });
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((comic: Comic) => {
        const cover_date = new Date(Date.parse(comic.cover_date));
        expect(cover_date.getFullYear()).not.toBeLessThan(
          filter_date.getFullYear()
        );
      });
    });

    it("returns only those comics published before on or the given end year", () => {
      const filter_date = new Date(Date.parse(COMIC_1000.cover_date));
      const result = pipe.transform(comics, {
        changed: false,
        publisher: "",
        series: "",
        volume: "",
        from_year: null,
        to_year: filter_date.getFullYear()
      });
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((comic: Comic) => {
        const cover_date = new Date(Date.parse(comic.cover_date));
        expect(cover_date.getFullYear()).not.toBeGreaterThan(
          filter_date.getFullYear()
        );
      });
    });

    it("returns an empty array if no comics match the filters", () => {
      const result = pipe.transform(comics, {
        changed: false,
        publisher: COMIC_1000.publisher
          .split("")
          .reverse()
          .join(""),
        series: COMIC_1000.series
          .split("")
          .reverse()
          .join(""),
        volume: COMIC_1000.volume
          .split("")
          .reverse()
          .join(""),
        from_year: null,
        to_year: null
      });
      expect(result.length).toEqual(0);
      result.forEach((comic: Comic) =>
        expect(comic.series).toEqual(COMIC_1000.series)
      );
    });
  });

  describe("#not_filtering()", () => {
    let filter: LibraryFilter;

    beforeEach(() => {
      filter = {
        changed: false,
        publisher: "",
        series: "",
        volume: "",
        from_year: null,
        to_year: null
      };
    });

    it("returns true if no filters are set", () => {
      expect(pipe.not_filtering(filter)).toBeTruthy();
    });

    it("returns false if a publisher is set", () => {
      filter.publisher = "Some value";
      expect(pipe.not_filtering(filter)).toBeFalsy();
    });

    it("returns false if a series is set", () => {
      filter.series = "Some value";
      expect(pipe.not_filtering(filter)).toBeFalsy();
    });

    it("returns false if a volume is set", () => {
      filter.volume = "Some value";
      expect(pipe.not_filtering(filter)).toBeFalsy();
    });

    it("returns false if a from year is set", () => {
      filter.from_year = 1980;
      expect(pipe.not_filtering(filter)).toBeFalsy();
    });

    it("returns false if a to year is set", () => {
      filter.to_year = 2019;
      expect(pipe.not_filtering(filter)).toBeFalsy();
    });
  });
});
