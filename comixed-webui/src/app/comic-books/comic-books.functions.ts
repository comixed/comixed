/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';

export function archiveTypeFromString(key: string): ArchiveType {
  switch (key) {
    case 'CBZ':
      return ArchiveType.CBZ;
    case 'CBR':
      return ArchiveType.CBR;
    case 'CB7':
      return ArchiveType.CB7;
  }
  return null;
}

export function comicTypeFromString(key: string): ComicType {
  switch (key) {
    case 'ISSUE':
      return ComicType.ISSUE;
    case 'MANGA':
      return ComicType.MANGA;
    case 'TRADEPAPERBACK':
      return ComicType.TRADEPAPERBACK;
  }
  return null;
}
