/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import {Pipe, PipeTransform} from '@angular/core';

import {Comic} from './comic.model';

@Pipe({
  name: 'series_filter'
})
export class SeriesFilterPipe implements PipeTransform {
  transform(comics: any[], search_terms: string): any[] {
    if (!comics) {
      return [];
    }
    if (!search_terms) {
      return comics;
    }

    search_terms = search_terms.toLowerCase();

    return comics.filter((comic: Comic) => {
      return (comic.series && comic.series.length > 0);
    }).filter((comic: Comic) => {
      return comic.series.toLowerCase().includes(search_terms);
    });
  }
}
