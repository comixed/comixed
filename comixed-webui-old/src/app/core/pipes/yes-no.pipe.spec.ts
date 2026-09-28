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

import { YesNoPipe } from './yes-no.pipe';
import { TEXT_NO, TEXT_YES } from '@app/core';

describe('YesNoPipe', () => {
  let pipe: YesNoPipe;

  beforeEach(() => {
    pipe = new YesNoPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns yes text when true', () => {
    expect(pipe.transform(true)).toEqual(TEXT_YES);
  });

  it('returns no text when false', () => {
    expect(pipe.transform(false)).toEqual(TEXT_NO);
  });

  it('returns no text when null', () => {
    expect(pipe.transform(null)).toEqual(TEXT_NO);
  });
});
