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
import { TranslateService } from "@ngx-translate/core";
import { SelectItem } from "primeng/api";

@Pipe({
  name: "comic_publisher"
})
export class ComicPublisherPipe implements PipeTransform {
  transform(comics: Array<Comic>, publisher_name: string): Array<Comic> {
    if ((comics || []).length === 0) {
      return [];
    }

    let result = comics.filter((comic: Comic) => {
      return (
        (publisher_name === "undefined" && !!!comic.publisher) ||
        comic.publisher === publisher_name
      );
    });

    return result;
  }
}
