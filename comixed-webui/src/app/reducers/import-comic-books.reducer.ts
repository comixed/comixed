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

import { createReducer, on } from '@ngrx/store';
import {
  addComicBooksUpdate,
  processComicBooksUpdate
} from '../actions/process-comics.actions';

export const IMPORT_COMIC_BOOKS_FEATURE_KEY = 'import_comic_books_state';

export interface ProcessingComicStatus {
  startTime: number;
  batchName: string;
  stepName: string;
  total: number;
  processed: number;
  progress: number;
}

export interface ImportComicBooksState {
  adding: {
    active: boolean;
    started: number;
    total: number;
    processed: number;
  };
  processing: {
    active: boolean;
    batches: ProcessingComicStatus[];
  };
}

export const initialState: ImportComicBooksState = {
  adding: {
    active: false,
    started: 0,
    total: 0,
    processed: 0
  },
  processing: {
    active: false,
    batches: []
  }
};

export const reducer = createReducer(
  initialState,

  on(addComicBooksUpdate, (state, action) => ({
    ...state,
    adding: {
      active: action.active,
      started: action.startTime,
      total: action.total,
      processed: action.processed
    }
  })),
  on(processComicBooksUpdate, (state, action) => {
    let batches = state.processing.batches.filter(
      entry => entry.batchName !== action.batchName
    );
    if (action.active) {
      batches = batches.concat({
        batchName: action.batchName,
        startTime: action.startTime,
        stepName: action.stepName,
        total: action.total,
        processed: action.processed,
        progress: action.processed / action.total
      });
    }
    return {
      ...state,
      processing: {
        active: batches.length > 0,
        batches
      }
    };
  })
);
