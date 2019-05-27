/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { UserPreferencePipe } from './user-preference.pipe';
import { TestBed } from '@angular/core/testing';
import { READER_USER } from 'app/models/user/user.fixtures';

describe('UserPreferencePipe', () => {
  const PREFERENCE_NAME = 'user.preference';
  const PREFERENCE_VALUE = 'the value';

  let pipe: UserPreferencePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserPreferencePipe]
    });

    pipe = TestBed.get(UserPreferencePipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns null if there is no user defined', () => {
    expect(pipe.transform(null, PREFERENCE_NAME)).toBeNull();
  });

  it('returns nothing when a preference is undefined', () => {
    expect(
      pipe.transform({ ...READER_USER, preferences: [] }, PREFERENCE_NAME)
    ).toBeNull();
  });

  it('returns the property if found', () => {
    expect(
      pipe.transform(
        {
          ...READER_USER,
          preferences: [{ name: PREFERENCE_NAME, value: PREFERENCE_VALUE }]
        },
        PREFERENCE_NAME
      )
    ).toEqual(PREFERENCE_VALUE);
  });
});
