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

import { beforeEach } from 'vitest';
import {
  initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY,
  metadataSourceListAdapter,
  MetadataSourceListState
} from '@app/metadata/reducers/metadata-source-list.reducer';
import {
  selectMetadataSourceListBusy,
  selectMetadataSourceListEntries,
  selectMetadataSourceListSelected
} from '@app/metadata/selectors/metadata-source-list.selectors';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/metadata/metadata-fixtures';

describe('MetadataSourceList Selectors', () => {
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
    state = metadataSourceListAdapter.setAll(TEST_METADATA_SOURCE_LIST, {
      ...initialMetadataSourceListState,
      busy: false
    });
  });

  describe('selecting the busy flag', () => {
    it('returns false when loading', () => {
      expect(
        selectMetadataSourceListBusy({
          [METADATA_SOURCE_LIST_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('returns true when loading', () => {
      expect(
        selectMetadataSourceListBusy({
          [METADATA_SOURCE_LIST_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  it('should return the configuration option list', () => {
    expect(
      selectMetadataSourceListEntries({
        [METADATA_SOURCE_LIST_FEATURE_KEY]: { ...state }
      })
    ).toStrictEqual(TEST_METADATA_SOURCE_LIST);
  });

  describe('the selected source', () => {
    it('should return the selected when present', () => {
      expect(
        selectMetadataSourceListSelected({
          [METADATA_SOURCE_LIST_FEATURE_KEY]: {
            ...state,
            selected: TEST_PREFERRED_METADATA_SOURCE
          }
        })
      ).toStrictEqual(TEST_PREFERRED_METADATA_SOURCE);
    });

    it('should return null when none are selected', () => {
      expect(
        selectMetadataSourceListSelected({
          [METADATA_SOURCE_LIST_FEATURE_KEY]: {
            ...state,
            selected: null
          }
        })
      ).toBeNull();
    });
  });
});
