/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  reducer,
  ScrapeStoryState
} from './scrape-story.reducer';
import {
  loadStoryCandidates,
  loadStoryCandidatesFailure,
  loadStoryCandidatesSuccess,
  resetStoryCandidates,
  scrapeStoryMetadata,
  scrapeStoryMetadataFailure,
  scrapeStoryMetadataSuccess
} from '@app/comic-metadata/actions/scrape-story.actions';
import {
  STORY_METADATA_1,
  STORY_METADATA_2,
  STORY_METADATA_3
} from '@app/comic-metadata/comic-metadata.constants';

describe('ScrapeStory Reducer', () => {
  const STORY_METADATA_LIST = [
    STORY_METADATA_1,
    STORY_METADATA_2,
    STORY_METADATA_3
  ];
  const SOURCE_ID = 717;
  const STORY_NAME = STORY_METADATA_1.name;
  const MAX_RECORDS = 1000;
  const SKIP_CACHE = Math.random() > 0.5;
  const REFERENCE_ID = STORY_METADATA_1.referenceId;

  let state: ScrapeStoryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('is not busy', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no candidates', () => {
      expect(state.candidates).toEqual([]);
    });
  });

  describe('resetting the list of candidates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, candidates: STORY_METADATA_LIST },
        resetStoryCandidates()
      );
    });

    it('clears the list of candidates', () => {
      expect(state.candidates).toEqual([]);
    });
  });

  describe('loading story candidates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadStoryCandidates({
          sourceId: SOURCE_ID,
          name: STORY_NAME,
          maxRecords: MAX_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            candidates: []
          },
          loadStoryCandidatesSuccess({ candidates: STORY_METADATA_LIST })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the candidates', () => {
        expect(state.candidates).toEqual(STORY_METADATA_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            candidates: STORY_METADATA_LIST
          },
          loadStoryCandidatesFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('clears any current candidates', () => {
        expect(state.candidates).toEqual([]);
      });
    });
  });

  describe('scraping a story', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        scrapeStoryMetadata({
          sourceId: SOURCE_ID,
          referenceId: REFERENCE_ID,
          skipCache: SKIP_CACHE
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy);
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, scrapeStoryMetadataSuccess());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, scrapeStoryMetadataFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
