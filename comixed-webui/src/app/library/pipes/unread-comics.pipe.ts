/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Pipe, PipeTransform } from '@angular/core';
import { LastRead } from '@app/last-read/models/last-read';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

@Pipe({
  name: 'unreadComics'
})
export class UnreadComicsPipe implements PipeTransform {
  transform(
    comicDetails: ComicDetail[],
    unreadOnly: boolean,
    lastReadDates: LastRead[]
  ): ComicDetail[] {
    if (!unreadOnly) {
      return comicDetails;
    }

    return comicDetails.filter(comicDetail => {
      return !lastReadDates.find(
        lastRead => lastRead.comicDetail.id === comicDetail.id
      );
    });
  }
}
