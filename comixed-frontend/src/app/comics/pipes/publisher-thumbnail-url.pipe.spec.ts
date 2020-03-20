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

import { PublisherThumbnailUrlPipe } from './publisher-thumbnail-url.pipe';
import { COMIC_2 } from 'app/comics/comics.fixtures';
import { GET_PUBLISHER_THUMBNAIL_URL } from 'app/library/library.constants';
import { interpolate } from 'app/app.functions';
import { MISSING_COMIC_IMAGE_URL } from 'app/comics/comics.constants';

describe('PublisherThumbnailUrlPipe', () => {
  const COMIC = COMIC_2;

  let pipe: PublisherThumbnailUrlPipe;

  beforeEach(() => {
    pipe = new PublisherThumbnailUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns a url when the publisher is defined', () => {
    expect(pipe.transform(COMIC)).toEqual(
      interpolate(GET_PUBLISHER_THUMBNAIL_URL, { name: COMIC.publisher })
    );
  });

  it('returns the missing image url when the publisher is not defined', () => {
    expect(pipe.transform({ ...COMIC, publisher: undefined })).toEqual(
      MISSING_COMIC_IMAGE_URL
    );
  });
});
