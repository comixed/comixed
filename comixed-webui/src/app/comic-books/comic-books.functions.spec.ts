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

import {
  archiveTypeFromString,
  comicTypeFromString
} from '@app/comic-books/comic-books.functions';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';

describe('ComicBook functions', () => {
  describe('converting strings to archive types', () => {
    it('converts CBZ', () => {
      expect(archiveTypeFromString('CBZ')).toBe(ArchiveType.CBZ);
    });

    it('converts CBR', () => {
      expect(archiveTypeFromString('CBR')).toBe(ArchiveType.CBR);
    });

    it('converts CB7', () => {
      expect(archiveTypeFromString('CB7')).toBe(ArchiveType.CB7);
    });
  });
  describe('converting strings to comic types', () => {
    it('converts issue', () => {
      expect(comicTypeFromString('ISSUE')).toBe(ComicType.ISSUE);
    });

    it('converts trade paperback', () => {
      expect(comicTypeFromString('TRADEPAPERBACK')).toBe(
        ComicType.TRADEPAPERBACK
      );
    });

    it('converts manga', () => {
      expect(comicTypeFromString('MANGA')).toBe(ComicType.MANGA);
    });
  });
});
