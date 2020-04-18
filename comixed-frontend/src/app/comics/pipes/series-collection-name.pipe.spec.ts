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

import {
  MISSING_SERIES,
  MISSING_VOLUME,
  SeriesCollectionNamePipe
} from './series-collection-name.pipe';
import { COMIC_2 } from 'app/comics/comics.fixtures';

describe('SeriesCollectionNamePipe', () => {
  const COMIC = COMIC_2;

  let pipe: SeriesCollectionNamePipe;

  beforeEach(() => {
    pipe = new SeriesCollectionNamePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns a consistent name when no series and volume are known', () => {
    expect(
      pipe.transform({
        ...COMIC,
        series: undefined,
        volume: undefined
      })
    ).toEqual(`${MISSING_SERIES} v${MISSING_VOLUME}`);
  });

  it('returns a consistent name when no volume is known', () => {
    expect(
      pipe.transform({
        ...COMIC,
        volume: undefined
      })
    ).toEqual(`${COMIC.series} v${MISSING_VOLUME}`);
  });

  it('returns a consistent name', () => {
    expect(pipe.transform(COMIC)).toEqual(`${COMIC.series} v${COMIC.volume}`);
  });
});
