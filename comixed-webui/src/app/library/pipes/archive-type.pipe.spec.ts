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

import { ArchiveTypePipe } from './archive-type.pipe';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';

describe('ArchiveTypePipe', () => {
  const CBZ1 = { ...COMIC_1, archiveType: ArchiveType.CBZ };
  const CBZ2 = { ...COMIC_2, archiveType: ArchiveType.CBZ };
  const CBZ3 = { ...COMIC_1, archiveType: ArchiveType.CBZ };
  const CBR1 = { ...COMIC_2, archiveType: ArchiveType.CBR };
  const CBR2 = { ...COMIC_3, archiveType: ArchiveType.CBR };
  const CBR3 = { ...COMIC_1, archiveType: ArchiveType.CBR };
  const CB71 = { ...COMIC_3, archiveType: ArchiveType.CB7 };
  const CB72 = { ...COMIC_2, archiveType: ArchiveType.CB7 };
  const CB73 = { ...COMIC_3, archiveType: ArchiveType.CB7 };
  const COMICS = [CBZ1, CBZ2, CBZ3, CBR1, CBR2, CBR3, CB71, CB72, CB73];

  let pipe: ArchiveTypePipe;

  beforeEach(() => {
    pipe = new ArchiveTypePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('can filter CBZ comics', () => {
    expect(pipe.transform(COMICS, ArchiveType.CBZ)).toEqual([CBZ1, CBZ2, CBZ3]);
  });

  it('can filter CBR comics', () => {
    expect(pipe.transform(COMICS, ArchiveType.CBR)).toEqual([CBR1, CBR2, CBR3]);
  });

  it('can filter CB7 comics', () => {
    expect(pipe.transform(COMICS, ArchiveType.CB7)).toEqual([CB71, CB72, CB73]);
  });
});
