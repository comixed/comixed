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

import { Pipe, PipeTransform } from "@angular/core";
import { Comic } from "../models/comics/comic";

@Pipe({
  name: "comic_location"
})
export class ComicLocationPipe implements PipeTransform {
  transform(comics: Array<Comic>, location_name: string): Array<Comic> {
    if (!!!comics || comics.length === 0) {
      return [];
    }

    let result = comics.filter((comic: Comic) => {
      return comic.locations.some((location: string) => {
        return location === location_name;
      });
    });

    return result;
  }
}
