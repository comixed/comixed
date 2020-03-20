/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { initialState, PublisherState, reducer } from './publisher.reducer';
import {
  PublisherGet,
  PublisherGetFailed,
  PublisherReceived
} from 'app/library/actions/publisher.actions';
import { PUBLISHER_1 } from 'app/library/models/publisher.fixtures';

describe('Publisher Reducer', () => {
  const PUBLISHER = PUBLISHER_1;
  const PUBLISHER_NAME = PUBLISHER.name;

  let state: PublisherState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the fetching publisher flag', () => {
      expect(state.fetchingPublisher).toBeFalsy();
    });

    it('clears the no such publisher flag', () => {
      expect(state.noSuchPublisher).toBeFalsy();
    });

    it('has no publisher', () => {
      expect(state.publisher).toBeNull();
    });
  });

  describe('fetching a publisher', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetchingPublisher: false, noSuchPublisher: true },
        new PublisherGet({ name: PUBLISHER_NAME })
      );
    });

    it('sets the fetching publisher flag', () => {
      expect(state.fetchingPublisher).toBeTruthy();
    });

    it('clears the no such publisher flag', () => {
      expect(state.noSuchPublisher).toBeFalsy();
    });
  });

  describe('receiving a publisher', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingPublisher: true,
          publisher: null
        },
        new PublisherReceived({ publisher: PUBLISHER })
      );
    });

    it('clears the fetching publisher flag', () => {
      expect(state.fetchingPublisher).toBeFalsy();
    });

    it('stores the publisher', () => {
      expect(state.publisher).toEqual(PUBLISHER);
    });
  });

  describe('failure to get a publisher', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          fetchingPublisher: true,
          noSuchPublisher: false,
          publisher: PUBLISHER
        },
        new PublisherGetFailed()
      );
    });

    it('clears the fetching publisher flag', () => {
      expect(state.fetchingPublisher).toBeFalsy();
    });

    it('sets the no such publisher flag', () => {
      expect(state.noSuchPublisher).toBeTruthy();
    });

    it('clears the publisher', () => {
      expect(state.publisher).toBeNull();
    });
  });
});
