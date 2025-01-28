/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { UNKNOWN_VALUE_PLACEHOLDER } from '@app/library/library.constants';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

@Pipe({
  name: 'comicTitle'
})
export class ComicTitlePipe implements PipeTransform {
  transform(comic: DisplayableComic | ComicDetail): string {
    const series = comic?.series || UNKNOWN_VALUE_PLACEHOLDER;
    const volume = comic?.volume || '????';
    const issueNumber = comic?.issueNumber || '??';
    return `${series} (${volume}) #${issueNumber}`;
  }
}
