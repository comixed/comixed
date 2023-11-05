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
  MetadataSourceState,
  reducer
} from './metadata-source.reducer';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  clearMetadataSource,
  deleteMetadataSource,
  deleteMetadataSourceFailed,
  loadMetadataSource,
  loadMetadataSourceFailed,
  metadataSourceDeleted,
  metadataSourceLoaded,
  metadataSourceSaved,
  saveMetadataSource,
  saveMetadataSourceFailed
} from '@app/comic-metadata/actions/metadata-source.actions';
import { resetMetadataState } from '@app/comic-metadata/actions/single-book-scraping.actions';

describe('MetadataSource Reducer', () => {
  const METADATA_SOURCE = METADATA_SOURCE_1;

  let state: MetadataSourceState;

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

    it('has no source', () => {
      expect(state.source).toBeNull();
    });
  });

  describe('resetting the state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, source: METADATA_SOURCE },
        clearMetadataSource()
      );
    });

    it('has no source', () => {
      expect(state.source).toBeNull();
    });
  });

  describe('loading a source', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadMetadataSource({ id: METADATA_SOURCE.id })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success loading a source', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: true,
          source: null
        },
        metadataSourceLoaded({ source: METADATA_SOURCE })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the source', () => {
      expect(state.source).toBe(METADATA_SOURCE);
    });
  });

  describe('failure loading a source', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          busy: true
        },
        loadMetadataSourceFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('saving a source', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        saveMetadataSource({ source: METADATA_SOURCE })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success saving a source', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, source: null },
        metadataSourceSaved({ source: METADATA_SOURCE })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the source', () => {
      expect(state.source).toBe(METADATA_SOURCE);
    });
  });

  describe('failure saving a source', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, saveMetadataSourceFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('deleting a source', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        deleteMetadataSource({ source: METADATA_SOURCE })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success deleting a source', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, source: METADATA_SOURCE },
        metadataSourceDeleted()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the current source', () => {
      expect(state.source).toBeNull();
    });
  });

  describe('failure deleting a source', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, deleteMetadataSourceFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
