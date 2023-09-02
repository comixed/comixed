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
  MetadataSourceListState,
  reducer
} from './metadata-source-list.reducer';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  loadMetadataSources,
  loadMetadataSourcesFailed,
  metadataSourcesLoaded
} from '@app/comic-metadata/actions/metadata-source-list.actions';

describe('MetadataSourceList Reducer', () => {
  const SOURCES = [METADATA_SOURCE_1];
  const ID = SOURCES[0].id;

  let state: MetadataSourceListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no sources', () => {
      expect(state.sources).toEqual([]);
    });
  });

  describe('loading the list of sources', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadMetadataSources());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('receiving the list of sources', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, sources: [] },
        metadataSourcesLoaded({ sources: SOURCES })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the source list', () => {
      expect(state.sources).toEqual(SOURCES);
    });
  });

  describe('failure loading the list of sources', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadMetadataSourcesFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
