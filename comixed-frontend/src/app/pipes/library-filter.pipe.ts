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

import { Pipe, PipeTransform } from '@angular/core';
import { Comic } from '../models/comics/comic';
import { LibraryFilter } from '../models/actions/library-filter';

@Pipe({
  name: 'library_filter'
})
export class LibraryFilterPipe implements PipeTransform {
  transform(comics: Array<Comic>, filters: LibraryFilter): any {
    if (!comics) {
      return [];
    }

    if (!filters) {
      return comics;
    }

    return comics.filter((comic: Comic) => {
      let result = true;

      if (filters.publisher.length > 0) {
        result = result && this.check_publisher(comic, filters.publisher);
      }
      if (filters.series.length > 0) {
        result = result && this.check_series(comic, filters.series);
      }
      if (filters.volume.length > 0) {
        result = result && this.check_volume(comic, filters.volume);
      }
      if (!!filters.from_year) {
        result = result && this.check_from_year(comic, filters.from_year);
      }
      if (!!filters.to_year) {
        result = result && this.check_to_year(comic, filters.to_year);
      }

      return result;
    });
  }

  not_filtering(filter: LibraryFilter): boolean {
    return (
      filter.publisher.length === 0 &&
      filter.series.length === 0 &&
      filter.volume.length === 0 &&
      !filter.from_year &&
      !filter.to_year
    );
  }

  check_publisher(comic: Comic, publisher: string): boolean {
    return (comic.publisher || '')
      .toLowerCase()
      .includes(publisher.toLowerCase());
  }

  check_series(comic: Comic, series: string): boolean {
    return (comic.series || '').toLowerCase().includes(series.toLowerCase());
  }

  check_volume(comic: Comic, volume: string): boolean {
    return (comic.volume || '').startsWith(volume);
  }

  check_from_year(comic: Comic, from_year: number): boolean {
    if (!from_year) {
      return true;
    }

    if (!(comic.cover_date || '').length) {
      return false;
    }

    const cover_date = new Date(Date.parse(comic.cover_date));
    return cover_date.getFullYear() >= from_year;
  }

  check_to_year(comic: Comic, to_year: number): boolean {
    if (!to_year) {
      return true;
    }

    if (!(comic.cover_date || '').length) {
      return false;
    }

    const cover_date = new Date(Date.parse(comic.cover_date));
    return cover_date.getFullYear() <= to_year;
  }
}
