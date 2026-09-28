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
  initialMessagingState,
  MESSAGING_FEATURE_KEY,
  MessagingState
} from '@app/messaging/reducers/messaging.reducer';
import { beforeEach } from 'vitest';
import { selectMessagingStarted } from '@app/messaging/selectors/messaging.selectors';

describe('Messaging Selectors', () => {
  let state: MessagingState;

  beforeEach(() => {
    state = { ...initialMessagingState };
  });

  describe('started', () => {
    it('should return false when starting', () => {
      expect(
        selectMessagingStarted({
          [MESSAGING_FEATURE_KEY]: { ...state, starting: true }
        })
      ).toBeFalsy();
    });

    it('should return true when started and stopping', () => {
      expect(
        selectMessagingStarted({
          [MESSAGING_FEATURE_KEY]: { ...state, stopping: true, started: true }
        })
      ).toBeTruthy();
    });

    it('should return false when stopping and not started', () => {
      expect(
        selectMessagingStarted({
          [MESSAGING_FEATURE_KEY]: { ...state, stopping: true, started: false }
        })
      ).toBeFalsy();
    });

    it('should return true when started', () => {
      expect(
        selectMessagingStarted({
          [MESSAGING_FEATURE_KEY]: {
            ...state,
            started: true,
            starting: false,
            stopping: false
          }
        })
      ).toBeTruthy();
    });
  });
});
