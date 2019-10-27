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

import { Pipe, PipeTransform } from '@angular/core';
import { Comic } from 'app/comics';
import { LibraryFilter } from 'app/library/models/library-filter';

@Pipe({
  name: 'comicFilter'
})
export class ComicFilterPipe implements PipeTransform {
  transform(comics: Comic[], filters: LibraryFilter): Comic[] {
    if (!comics || !comics.length) {
      return [];
    }

    if (!filters) {
      return comics;
    }

    return comics.filter(comic => {
      return (
        (!filters.publisher || filters.publisher === comic.publisher) &&
        (!filters.series || filters.series === comic.series)
      );
    });
  }
}
