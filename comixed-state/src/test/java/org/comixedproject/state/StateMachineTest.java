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

package org.comixedproject.state;

import static org.junit.jupiter.api.Assertions.*;

import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.state.StatefulItem;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StateMachineTest {
  private static final ComicState TEST_STARTING_STATE = ComicState.STABLE;
  private static final ComicEvent TEST_EVENT = ComicEvent.comicMetadataChanged;
  private static final ComicState TEST_ENDING_STATE = ComicState.CHANGED;
  private static final Enum TEST_UNSUPPORTED_EVENT = ComicEvent.comicFileFound;

  private StateMachine stateMachine = new StateMachine(ComicState.class, ComicEvent.class);

  @Mock private StateTransitionGuard guard;
  @Mock private StateTransitionAction action;
  @Mock private StatefulItem comic;

  @Test
  void startingState_nullState() {
    assertThrows(NullPointerException.class, () -> stateMachine.startingState(null));
  }

  @Test
  void startingState_alreadyDefined() {
    stateMachine.startingState = TEST_STARTING_STATE;
    assertThrows(
        IllegalStateException.class, () -> stateMachine.startingState(TEST_STARTING_STATE));
  }

  @Test
  void startingState() {
    stateMachine.startingState(TEST_STARTING_STATE);

    assertSame(TEST_STARTING_STATE, stateMachine.startingState);
  }

  @Test
  void onEvent_nullEvent() {
    assertThrows(NullPointerException.class, () -> stateMachine.onEvent(null));
  }

  @Test
  void onEvent_alreadyDefined() {
    stateMachine.event = TEST_EVENT;
    assertThrows(IllegalStateException.class, () -> stateMachine.onEvent(TEST_EVENT));
  }

  @Test
  void onEvent() {
    stateMachine.onEvent(TEST_EVENT);

    assertSame(TEST_EVENT, stateMachine.event);
  }

  @Test
  void endingState_nullState() {
    assertThrows(NullPointerException.class, () -> stateMachine.endingState(null));
  }

  @Test
  void endingState_alreadyDefined() {
    stateMachine.endingState = TEST_ENDING_STATE;
    assertThrows(IllegalStateException.class, () -> stateMachine.endingState(TEST_ENDING_STATE));
  }

  @Test
  void endingState() {
    stateMachine.endingState(TEST_ENDING_STATE);

    assertSame(TEST_ENDING_STATE, stateMachine.endingState);
  }

  @Test
  void withAction_nullState() {
    assertThrows(NullPointerException.class, () -> stateMachine.withAction(null));
  }

  @Test
  void withAction_alreadyDefined() {
    stateMachine.action = action;
    assertThrows(IllegalStateException.class, () -> stateMachine.withAction(action));
  }

  @Test
  void withAction() {
    stateMachine.withAction(action);

    assertSame(action, stateMachine.action);
  }

  @Test
  void processEvent_nullItem() {
    assertThrows(NullPointerException.class, () -> stateMachine.processEvent(null, TEST_EVENT));
  }

  @Test
  void processEvent_nullEvent() {
    assertThrows(NullPointerException.class, () -> stateMachine.processEvent(comic, null));
  }

  @Test
  void and_noTransitionDefined() {
    assertThrows(StateTransitionActionException.class, () -> stateMachine.and());
  }

  @Test
  void build_noTransitionDefined() {
    assertThrows(StateTransitionActionException.class, () -> stateMachine.build());
  }

  @Test
  void processEvent_nothingDefined() {
    Mockito.when(comic.getState()).thenReturn(ComicState.STABLE);

    assertThrows(
        StateTransitionActionException.class, () -> stateMachine.processEvent(comic, TEST_EVENT));
  }

  @Test
  void processEvent_unsupportedStartingState() {
    stateMachine
        .startingState(TEST_ENDING_STATE)
        .onEvent(TEST_EVENT)
        .afterGuard(guard)
        .endingState(TEST_ENDING_STATE)
        .withAction(action)
        .build();

    Mockito.when(comic.getState()).thenReturn(ComicState.STABLE);

    assertThrows(
        StateTransitionActionException.class, () -> stateMachine.processEvent(comic, TEST_EVENT));
  }

  @Test
  void processEvent_unsupportedEvent() {
    stateMachine
        .startingState(TEST_STARTING_STATE)
        .onEvent(TEST_UNSUPPORTED_EVENT)
        .afterGuard(guard)
        .endingState(TEST_ENDING_STATE)
        .withAction(action)
        .build();

    Mockito.when(comic.getState()).thenReturn(ComicState.STABLE);

    assertThrows(
        StateTransitionActionException.class, () -> stateMachine.processEvent(comic, TEST_EVENT));
  }

  @Test
  void processEvent_guardBlocks() {
    stateMachine
        .startingState(TEST_STARTING_STATE)
        .onEvent(TEST_EVENT)
        .afterGuard(guard)
        .endingState(TEST_ENDING_STATE)
        .withAction(action)
        .build();

    Mockito.when(comic.getState()).thenReturn(ComicState.STABLE);
    Mockito.when(guard.evaluate(Mockito.any())).thenReturn(Boolean.FALSE);

    stateMachine.processEvent(comic, TEST_EVENT);

    Mockito.verify(guard).evaluate(comic);
    Mockito.verify(comic, Mockito.never()).setState(TEST_ENDING_STATE);
  }

  @Test
  void processEvent_actionThrowsException() {
    stateMachine
        .startingState(TEST_STARTING_STATE)
        .onEvent(TEST_EVENT)
        .afterGuard(guard)
        .endingState(TEST_ENDING_STATE)
        .withAction(action)
        .build();

    Mockito.when(comic.getState()).thenReturn(ComicState.STABLE);
    Mockito.when(guard.evaluate(Mockito.any())).thenReturn(Boolean.TRUE);
    Mockito.doThrow(StateTransitionActionException.class).when(action).execute(Mockito.any());

    assertThrows(
        StateTransitionActionException.class, () -> stateMachine.processEvent(comic, TEST_EVENT));

    Mockito.verify(guard).evaluate(comic);
    Mockito.verify(comic, Mockito.never()).setState(TEST_ENDING_STATE);
  }

  @Test
  void processEvent() {
    stateMachine
        .startingState(TEST_STARTING_STATE)
        .onEvent(TEST_EVENT)
        .afterGuard(guard)
        .endingState(TEST_ENDING_STATE)
        .withAction(action)
        .build();

    Mockito.when(comic.getState()).thenReturn(ComicState.STABLE);
    Mockito.when(guard.evaluate(Mockito.any())).thenReturn(Boolean.TRUE);

    stateMachine.processEvent(comic, TEST_EVENT);

    Mockito.verify(guard).evaluate(comic);
    Mockito.verify(comic).setState(TEST_ENDING_STATE);
  }
}
