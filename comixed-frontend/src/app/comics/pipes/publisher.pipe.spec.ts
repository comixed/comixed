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

import { PublisherPipe } from './publisher.pipe';
import { COMIC_2 } from 'app/comics/comics.fixtures';
import { interpolate } from 'app/app.functions';
import { PUBLISHER_IMPRINT_FORMAT } from 'app/comics/comics.constants';

describe('PublisherPipe', () => {
  const PUBLISHER = 'The Publisher';
  const IMPRINT = 'The Imprint';

  let pipe: PublisherPipe;

  beforeEach(() => {
    pipe = new PublisherPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns an empty string if no publisher is defined', () => {
    expect(pipe.transform({ ...COMIC_2, publisher: null })).toEqual('');
  });

  it('shows only the publisher if no imprint is defined', () => {
    expect(
      pipe.transform({ ...COMIC_2, publisher: PUBLISHER, imprint: null })
    ).toEqual(PUBLISHER);
  });

  it('includes the imprint if present', () => {
    expect(
      pipe.transform({ ...COMIC_2, publisher: PUBLISHER, imprint: IMPRINT })
    ).toEqual(
      interpolate(PUBLISHER_IMPRINT_FORMAT, {
        publisher: PUBLISHER,
        imprint: IMPRINT
      })
    );
  });
});
