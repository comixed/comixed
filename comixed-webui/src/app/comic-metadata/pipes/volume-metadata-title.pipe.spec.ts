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

import { VolumeMetadataTitlePipe } from './volume-metadata-title.pipe';
import { SCRAPING_VOLUME_1 } from '@app/comic-metadata/comic-metadata.fixtures';

describe('VolumeMetadataTitlePipe', () => {
  const VOLUME = SCRAPING_VOLUME_1;

  let pipe: VolumeMetadataTitlePipe;

  beforeEach(() => {
    pipe = new VolumeMetadataTitlePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('generates a title from a volume', () => {
    expect(pipe.transform(VOLUME)).toEqual(
      `${VOLUME.name} v${VOLUME.startYear}`
    );
  });
});
