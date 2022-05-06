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

import { ComicTitlePipe } from './comic-title.pipe';
import { COMIC_BOOK_3 } from '@app/comic-books/comic-books.fixtures';
import { UNKNOWN_VALUE_PLACEHOLDER } from '@app/library/library.constants';

describe('ComicTitlePipe', () => {
  const COMIC = COMIC_BOOK_3;

  let pipe: ComicTitlePipe;

  beforeEach(() => {
    pipe = new ComicTitlePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('can handle a missing series name', () => {
    expect(
      pipe.transform({
        ...COMIC,
        series: null
      })
    ).toEqual(
      `${UNKNOWN_VALUE_PLACEHOLDER} (${COMIC.volume}) #${COMIC.issueNumber}`
    );
  });

  it('can handle a missing volume', () => {
    expect(
      pipe.transform({
        ...COMIC,
        volume: null
      })
    ).toEqual(`${COMIC.series} (????) #${COMIC.issueNumber}`);
  });

  it('can handle a missing issue number', () => {
    expect(
      pipe.transform({
        ...COMIC,
        issueNumber: null
      })
    ).toEqual(`${COMIC.series} (${COMIC.volume}) #??`);
  });

  it('can handle a well-formed comic', () => {
    expect(pipe.transform(COMIC)).toEqual(
      `${COMIC.series} (${COMIC.volume}) #${COMIC.issueNumber}`
    );
  });
});
