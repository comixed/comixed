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
  const PROCESSING_ACTIVE = Math.random() > 0.5;
  const PROCESSING_STARTED = new Date().getTime();
  const PROCESSING_STEP_NAME = 'step-name';
  const PROCESSING_TOTAL = 73;
  const PROCESSING_PROCESSED = 37;

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

    it('has no processing started date', () => {
      expect(state.processing.started).toEqual(0);
    });

    it('has no processing step name', () => {
      expect(state.processing.stepName).toEqual('');
    });

    it('has no processing total comic count', () => {
      expect(state.processing.total).toEqual(0);
    });

    it('has no processing processed comic count', () => {
      expect(state.processing.processed).toEqual(0);
    });
  });

  describe('receiving an adding update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          processing: {
            active: !ADDING_ACTIVE,
            started: 0,
            stepName: '',
            total: 0,
            processed: 0
          }
        },
        addComicBooksUpdate({
          active: ADDING_ACTIVE,
          started: ADDING_STARTED,
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

  describe('receiving an processing update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          processing: {
            active: !PROCESSING_ACTIVE,
            started: 0,
            stepName: '',
            total: 0,
            processed: 0
          }
        },
        processComicBooksUpdate({
          active: PROCESSING_ACTIVE,
          started: PROCESSING_STARTED,
          stepName: PROCESSING_STEP_NAME,
          total: PROCESSING_TOTAL,
          processed: PROCESSING_PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.processing.active).toEqual(PROCESSING_ACTIVE);
    });

    it('sets the started date', () => {
      expect(state.processing.started).toEqual(PROCESSING_STARTED);
    });

    it('sets the step name', () => {
      expect(state.processing.stepName).toEqual(PROCESSING_STEP_NAME);
    });

    it('sets the total count', () => {
      expect(state.processing.total).toEqual(PROCESSING_TOTAL);
    });

    it('sets the processed count', () => {
      expect(state.processing.processed).toEqual(PROCESSING_PROCESSED);
    });
  });
});
