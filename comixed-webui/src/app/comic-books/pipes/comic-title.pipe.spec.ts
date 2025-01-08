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
import {
  COMIC_DETAIL_1,
  DISPLAYABLE_COMIC_1
} from '@app/comic-books/comic-books.fixtures';
import { UNKNOWN_VALUE_PLACEHOLDER } from '@app/library/library.constants';

describe('ComicTitlePipe', () => {
  const DISPLAYABLE_COMIC = DISPLAYABLE_COMIC_1;
  const COMIC_DETAIL = COMIC_DETAIL_1;

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
        ...DISPLAYABLE_COMIC,
        series: null
      })
    ).toEqual(
      `${UNKNOWN_VALUE_PLACEHOLDER} (${DISPLAYABLE_COMIC.volume}) #${DISPLAYABLE_COMIC.issueNumber}`
    );
  });

  it('can handle a missing volume', () => {
    expect(
      pipe.transform({
        ...DISPLAYABLE_COMIC,
        volume: null
      })
    ).toEqual(
      `${DISPLAYABLE_COMIC.series} (????) #${DISPLAYABLE_COMIC.issueNumber}`
    );
  });

  it('can handle a missing issue number', () => {
    expect(
      pipe.transform({
        ...DISPLAYABLE_COMIC,
        issueNumber: null
      })
    ).toEqual(`${DISPLAYABLE_COMIC.series} (${DISPLAYABLE_COMIC.volume}) #??`);
  });

  it('can handle a well-formed displayable comic', () => {
    expect(pipe.transform(DISPLAYABLE_COMIC)).toEqual(
      `${DISPLAYABLE_COMIC.series} (${DISPLAYABLE_COMIC.volume}) #${DISPLAYABLE_COMIC.issueNumber}`
    );
  });

  it('can handle a well-formed comic detail', () => {
    expect(pipe.transform(COMIC_DETAIL)).toEqual(
      `${COMIC_DETAIL.series} (${COMIC_DETAIL.volume}) #${COMIC_DETAIL.issueNumber}`
    );
  });
});
