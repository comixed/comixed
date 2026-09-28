/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  initialMetadataSourceListState,
  metadataSourceListAdapter,
  metadataSourceListReducer,
  MetadataSourceListState
} from '../reducers/metadata-source-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { MetadataSourceListActions } from '@app/settings/actions/metadata-source-list.actions';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/settings/settings-fixtures';

describe('MetadataSourceList Reducer', () => {
  const TEST_PREFERRED_METADATA_SOURCE = {
    ...METADATA_SOURCE_1,
    preferred: true
  };
  const TEST_OTHER_METADATA_SOURCE = METADATA_SOURCE_2;
  const TEST_METADATA_SOURCE_LIST = [
    TEST_PREFERRED_METADATA_SOURCE,
    TEST_OTHER_METADATA_SOURCE
  ];

  let state: MetadataSourceListState;

  beforeEach(() => {
    state = { ...initialMetadataSourceListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = metadataSourceListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should not have a selected source', () => {
      expect(state.selected).toBeNull();
    });
  });

  describe('selecting a source', () => {
    beforeEach(() => {
      state = metadataSourceListReducer(
        {
          ...state,
          selected: null
        },
        MetadataSourceListActions.setSelected({
          selected: TEST_OTHER_METADATA_SOURCE
        })
      );
    });

    it('should set the source as selected', () => {
      expect(state.selected).toStrictEqual(TEST_OTHER_METADATA_SOURCE);
    });
  });

  describe('loading the metadata source list', () => {
    beforeEach(() => {
      state = metadataSourceListReducer(
        { ...state, busy: false },
        MetadataSourceListActions.load()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = metadataSourceListReducer(
          metadataSourceListAdapter.setAll([], {
            ...state,
            busy: true,
            selected: null
          }),
          MetadataSourceListActions.loadSuccess({
            entries: TEST_METADATA_SOURCE_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the metadata source list', () => {
        expect(
          metadataSourceListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_METADATA_SOURCE_LIST);
      });

      it('should preset the selected source to the preferred source', () => {
        expect(state.selected).toStrictEqual(TEST_PREFERRED_METADATA_SOURCE);
      });
    });

    describe('success with no preferred source', () => {
      beforeEach(() => {
        state = metadataSourceListReducer(
          metadataSourceListAdapter.setAll([], {
            ...state,
            busy: true,
            selected: null
          }),
          MetadataSourceListActions.loadSuccess({
            entries: [TEST_OTHER_METADATA_SOURCE]
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the metadata source list', () => {
        expect(
          metadataSourceListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual([TEST_OTHER_METADATA_SOURCE]);
      });

      it('should clear selected source to the preferred source', () => {
        expect(state.selected).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = metadataSourceListReducer(
          metadataSourceListAdapter.setAll([], { ...state, busy: true }),
          MetadataSourceListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });

  describe('saving the metadata source list', () => {
    beforeEach(() => {
      state = metadataSourceListReducer(
        { ...state, busy: false },
        MetadataSourceListActions.save({ source: TEST_OTHER_METADATA_SOURCE })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = metadataSourceListReducer(
          metadataSourceListAdapter.setAll([], {
            ...state,
            busy: true,
            selected: null
          }),
          MetadataSourceListActions.saveSuccess({
            entries: TEST_METADATA_SOURCE_LIST
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the metadata source list', () => {
        expect(
          metadataSourceListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_METADATA_SOURCE_LIST);
      });

      it('should preset the selected source to the preferred source', () => {
        expect(state.selected).toStrictEqual(TEST_PREFERRED_METADATA_SOURCE);
      });
    });

    describe('success with no preferred source', () => {
      beforeEach(() => {
        state = metadataSourceListReducer(
          metadataSourceListAdapter.setAll([], {
            ...state,
            busy: true,
            selected: null
          }),
          MetadataSourceListActions.saveSuccess({
            entries: [TEST_OTHER_METADATA_SOURCE]
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the metadata source list', () => {
        expect(
          metadataSourceListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual([TEST_OTHER_METADATA_SOURCE]);
      });

      it('should clear selected source to the preferred source', () => {
        expect(state.selected).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = metadataSourceListReducer(
          metadataSourceListAdapter.setAll([], { ...state, busy: true }),
          MetadataSourceListActions.saveFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
