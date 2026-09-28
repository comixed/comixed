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

import {
  initialState,
  MetadataUpdateProcessState,
  reducer
} from './metadata-update-process.reducer';
import { metadataUpdateProcessStatusUpdated } from '@app/comic-metadata/actions/metadata-update-process.actions';

describe('MetadataUpdateProcess Reducer', () => {
  const ACTIVE = Math.random() > 0.5;
  const TOTAL_COMICS = Math.abs(Math.random() * 100);
  const COMPLETED_COMICS = Math.abs(Math.random() * 100);

  let state: MetadataUpdateProcessState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the active flag', () => {
      expect(state.active).toBeFalse();
    });

    it('has no total comics', () => {
      expect(state.totalComics).toEqual(0);
    });

    it('has no completed comics', () => {
      expect(state.completedComics).toEqual(0);
    });
  });

  describe('receiving an update', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          active: !ACTIVE,
          totalComics: 0,
          completedComics: 0
        },
        metadataUpdateProcessStatusUpdated({
          active: ACTIVE,
          totalComics: TOTAL_COMICS,
          completedComics: COMPLETED_COMICS
        })
      );
    });

    it('updates the active flag', () => {
      expect(state.active).toEqual(ACTIVE);
    });

    it('updates the total comics', () => {
      expect(state.totalComics).toEqual(TOTAL_COMICS);
    });

    it('updates the completed comics', () => {
      expect(state.completedComics).toEqual(COMPLETED_COMICS);
    });
  });
});
