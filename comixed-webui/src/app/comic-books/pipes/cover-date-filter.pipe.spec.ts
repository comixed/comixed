/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { CoverDateFilterPipe } from './cover-date-filter.pipe';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';

describe('CoverDateFilterPipe', () => {
  const NOW = new Date();
  const LAST_YEAR = new Date(NOW.getTime() - 365 * 24 * 60 * 60 * 1000);
  const LAST_MONTH = new Date(NOW.getTime());
  const COMIC_LAST_YEAR = { ...COMIC_DETAIL_1, coverDate: LAST_YEAR.getTime() };
  const COMIC_LAST_MONTH = {
    ...COMIC_DETAIL_3,
    coverDate: LAST_MONTH.getTime()
  };
  const COMIC_TODAY = { ...COMIC_DETAIL_5, coverDate: NOW.getTime() };
  const COMICS = [COMIC_LAST_YEAR, COMIC_LAST_MONTH, COMIC_TODAY];

  let pipe: CoverDateFilterPipe;

  beforeEach(() => {
    pipe = new CoverDateFilterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns all comic when no filter is selected', () => {
    expect(pipe.transform(COMICS, { year: null, month: null })).toEqual(COMICS);
  });

  it('can filter by year', () => {
    expect(
      pipe
        .transform(COMICS, { year: LAST_YEAR.getFullYear(), month: null })
        .every(
          entry =>
            new Date(entry.coverDate).getFullYear() === LAST_YEAR.getFullYear()
        )
    ).toBeTrue();
  });

  it('can filter by month only', () => {
    expect(
      pipe
        .transform(COMICS, { year: null, month: LAST_MONTH.getMonth() })
        .every(
          entry =>
            new Date(entry.coverDate).getMonth() === LAST_MONTH.getMonth()
        )
    ).toBeTrue();
  });

  it('can filter by month and year', () => {
    expect(
      pipe
        .transform(COMICS, { year: NOW.getFullYear(), month: NOW.getMonth() })
        .every(
          entry =>
            new Date(entry.coverDate).getMonth() === NOW.getMonth() &&
            new Date(entry.coverDate).getFullYear() === NOW.getFullYear()
        )
    ).toBeTrue();
  });
});
