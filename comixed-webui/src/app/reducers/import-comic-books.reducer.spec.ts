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

import {
  ImportComicBooksState,
  initialState,
  reducer
} from './import-comic-books.reducer';
import {
  addComicBooksUpdate,
  processComicBooksUpdate
} from '@app/actions/process-comics.actions';

describe('ImportComicBooks Reducer', () => {
  const ADDING_ACTIVE = Math.random() > 0.5;
  const ADDING_STARTED = new Date().getTime();
  const ADDING_TOTAL = 73;
  const ADDING_PROCESSED = 37;
  const PROCESSING_STARTED = new Date().getTime();
  const PROCESSING_STEP_BATCH_NAME = 'batch-name';
  const PROCESSING_STEP_NAME = 'step-name';
  const PROCESSING_TOTAL = 73;
  const PROCESSING_PROCESSED = 37;
  const PROCESSING_PROGRESS = PROCESSING_PROCESSED / PROCESSING_TOTAL;

  let state: ImportComicBooksState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the adding active flag', () => {
      expect(state.adding.active).toBeFalse();
    });

    it('has no adding started date', () => {
      expect(state.adding.started).toEqual(0);
    });

    it('has no adding total comic count', () => {
      expect(state.adding.total).toEqual(0);
    });

    it('has no adding processed comic count', () => {
      expect(state.adding.processed).toEqual(0);
    });

    it('clears the processing active flag', () => {
      expect(state.processing.active).toBeFalse();
    });

    it('has no processing batches', () => {
      expect(state.processing.batches.length).toEqual(0);
    });
  });

  describe('receiving an adding update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          adding: {
            active: !ADDING_ACTIVE,
            started: 0,
            total: 0,
            processed: 0
          }
        },
        addComicBooksUpdate({
          active: ADDING_ACTIVE,
          startTime: ADDING_STARTED,
          total: ADDING_TOTAL,
          processed: ADDING_PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.adding.active).toEqual(ADDING_ACTIVE);
    });

    it('sets the started date', () => {
      expect(state.adding.started).toEqual(ADDING_STARTED);
    });

    it('sets the total count', () => {
      expect(state.adding.total).toEqual(ADDING_TOTAL);
    });

    it('sets the processed count', () => {
      expect(state.adding.processed).toEqual(ADDING_PROCESSED);
    });
  });

  describe('receiving a processing update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));
    const NEW_BATCH_NAME = `${PROCESSING_STEP_BATCH_NAME}1`;

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          processing: {
            active: false,
            batches: [
              {
                startTime: PROCESSING_STARTED,
                batchName: PROCESSING_STEP_BATCH_NAME,
                stepName: PROCESSING_STEP_NAME,
                total: PROCESSING_TOTAL,
                processed: PROCESSING_PROCESSED,
                progress: PROCESSING_PROGRESS
              }
            ]
          }
        },
        processComicBooksUpdate({
          active: true,
          startTime: PROCESSING_STARTED + 1000,
          batchName: NEW_BATCH_NAME,
          stepName: PROCESSING_STEP_NAME,
          total: PROCESSING_TOTAL,
          processed: PROCESSING_PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.processing.active).toEqual(true);
    });

    it('contains batches', () => {
      expect(state.processing.batches.length).toEqual(2);
    });

    it('sets the started date', () => {
      expect(state.processing.batches[0].startTime).toEqual(PROCESSING_STARTED);
    });

    it('sets the step name', () => {
      expect(state.processing.batches[0].stepName).toEqual(
        PROCESSING_STEP_NAME
      );
    });

    it('sets the total count', () => {
      expect(state.processing.batches[0].total).toEqual(PROCESSING_TOTAL);
    });

    it('sets the processed count', () => {
      expect(state.processing.batches[0].processed).toEqual(
        PROCESSING_PROCESSED
      );
    });
  });

  describe('receiving a completed batch processing update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          processing: {
            active: true,
            batches: [{ batchName: PROCESSING_STEP_BATCH_NAME } as any]
          }
        },
        processComicBooksUpdate({
          active: false,
          startTime: PROCESSING_STARTED,
          batchName: PROCESSING_STEP_BATCH_NAME,
          stepName: PROCESSING_STEP_NAME,
          total: PROCESSING_TOTAL,
          processed: PROCESSING_PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.processing.active).toEqual(false);
    });

    it('removes the completed batch', () => {
      expect(state.processing.batches.length).toEqual(0);
    });
  });
});
