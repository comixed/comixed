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
import { COMIXED_API_ROOT } from 'app/app.constants';
import { ComicFile } from 'app/comic-import/models/comic-file';

@Pipe({
  name: 'comic_file_cover_url'
})
export class ComicFileCoverUrlPipe implements PipeTransform {
  transform(comic_file: ComicFile): string {
    return `${COMIXED_API_ROOT}/files/import/cover?filename=${encodeURIComponent(
      comic_file.filename
    )}`;
  }
}
