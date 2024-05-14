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
import { processComicBooksUpdate } from '@app/actions/process-comics.actions';

describe('ImportComicBooks Reducer', () => {
  const STEP_NAME = 'step-name';
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

    it('clears the processing active flag', () => {
      expect(state.active).toBeFalse();
    });

    it('has no processing batches', () => {
      expect(state.batches.length).toEqual(0);
    });
  });

  describe('receiving a processing update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          active: false,
          batches: [
            {
              stepName: STEP_NAME,
              total: PROCESSING_TOTAL,
              processed: PROCESSING_PROCESSED,
              progress: PROCESSING_PROGRESS
            }
          ]
        },
        processComicBooksUpdate({
          active: true,
          stepName: STEP_NAME,
          total: PROCESSING_TOTAL,
          processed: PROCESSING_PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.active).toEqual(true);
    });

    it('contains batches', () => {
      expect(state.batches.length).toEqual(1);
    });

    it('sets the step name', () => {
      expect(state.batches[0].stepName).toEqual(STEP_NAME);
    });

    it('sets the total count', () => {
      expect(state.batches[0].total).toEqual(PROCESSING_TOTAL);
    });

    it('sets the processed count', () => {
      expect(state.batches[0].processed).toEqual(PROCESSING_PROCESSED);
    });
  });

  describe('receiving a completed batch processing update', () => {
    const COUNT = Math.abs(Math.floor(Math.random() * 1000));

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          active: true,
          batches: [{ stepName: STEP_NAME } as any]
        },
        processComicBooksUpdate({
          active: false,
          stepName: STEP_NAME,
          total: PROCESSING_TOTAL,
          processed: PROCESSING_PROCESSED
        })
      );
    });

    it('sets the active flag', () => {
      expect(state.active).toEqual(false);
    });

    it('removes the completed batch', () => {
      expect(state.batches.length).toEqual(0);
    });
  });
});
