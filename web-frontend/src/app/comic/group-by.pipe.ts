/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import {
  Pipe,
  PipeTransform,
} from '@angular/core';


import {Comic} from './comic.model';

@Pipe({
  name: 'group_by'
})
export class GroupByPipe implements PipeTransform {

  constructor() {}

  transform(comics: any[], grouped_by: number): any[] {
    if (comics.length === 0) {
      return comics;
    }

    // if we're not grouping then just return the comics
    if (grouped_by === 0) {
      return comics;
    }

    const grouped_comics = comics.reduce((previous, current) => {
      let group_name = `Unknown grouping: ${grouped_by}`;

      switch (grouped_by) {
        case 1: group_name = `${current.series || 'Unknown'} (${current.volume || 'Unknown'})`; break;
        case 2: group_name = `${current.publisher || 'Unknown'}`; break;
        case 3: group_name = `${current.year_published || '1900'}`; break;
      }

      if (!previous[group_name]) {
        previous[group_name] = [current];
      } else {
        previous[group_name].push(current);
      }
      return previous;
    }, {});

    return Object.keys(grouped_comics).map(key => ({key, values: grouped_comics[key]}));
  }
}
