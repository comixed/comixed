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

import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.state.StatefulItem;

/**
 * <code>StateMachine</code> defines a type that holds the definition for a state machine and
 * processes state events on it.
 *
 * @param <T> the stateful type
 * @param <S> the state type
 * @param <E> the event type
 * @author Darryl L. Pierce
 */
@Log4j2
public class StateMachine<T extends StatefulItem<S>, S extends Enum<S>, E extends Enum<E>> {
  private final Class<S> stateClass;
  private final Class<E> eventClass;
  private Map<S, Map<E, StateDescription<S, T>>> transitions;

  S startingState;
  S endingState;
  E event;
  private StateTransitionGuard guard;
  StateTransitionAction<T> action;

  public StateMachine(final Class<S> stateClass, final Class<E> eventClass) {
    this.stateClass = stateClass;
    this.eventClass = eventClass;
    this.transitions = new EnumMap<>(this.stateClass);
  }

  public StateMachine<T, S, E> startingState(@NonNull final S state) {
    if (Objects.nonNull(this.startingState))
      throw new IllegalStateException("Starting state is already defined");
    this.startingState = state;
    return this;
  }

  public StateMachine<T, S, E> onEvent(@NonNull final E event) {
    if (Objects.nonNull(this.event)) throw new IllegalStateException("Event is already defined");
    this.event = event;
    return this;
  }

  public StateMachine<T, S, E> afterGuard(@NonNull final StateTransitionGuard<T> guard) {
    if (Objects.nonNull(this.guard)) throw new IllegalStateException("Guard is already defined");
    this.guard = guard;
    return this;
  }

  public StateMachine<T, S, E> endingState(@NonNull final S state) {
    if (Objects.nonNull(this.endingState))
      throw new IllegalStateException("Ending state is already defined");
    this.endingState = state;
    return this;
  }

  public StateMachine<T, S, E> withAction(@NonNull final StateTransitionAction<T> action) {
    if (Objects.nonNull(this.action)) throw new IllegalStateException("Action is already defined");
    this.action = action;
    return this;
  }

  public StateMachine<T, S, E> and() {
    return this.doCreateTransition();
  }

  public StateMachine<T, S, E> build() {
    return this.doCreateTransition();
  }

  public void processEvent(@NonNull final T item, @NonNull final E event)
      throws StateTransitionActionException {
    final S currentState = item.getState();
    if (!this.transitions.containsKey(currentState)) {
      throw new StateTransitionActionException(
          String.format("No state transitions: %s", currentState));
    }

    final Map<E, StateDescription<S, T>> transition = this.transitions.get(currentState);
    if (!transition.containsKey(event)) {
      throw new StateTransitionActionException(
          String.format("No event defined for state: %s:%s", currentState, event));
    }

    final StateDescription<S, T> definition = transition.get(event);
    if (Objects.nonNull(definition.getGuard())) {
      log.debug("Executing state transition guard");
      if (!definition.getGuard().evaluate(item)) {
        log.debug("Guard blocked transition");
        return;
      }
    }

    if (Objects.nonNull(definition.getAction())) {
      log.debug("Executing pre-transition action");
      definition.getAction().execute(item);
    }

    final S targetState = transition.get(event).getTargetState();
    log.debug(
        String.format(
            "Performing state transition: %s:%s => %s", currentState, event, targetState));
    item.setState(targetState);
  }

  private StateMachine<T, S, E> doCreateTransition() {
    if (Objects.isNull(this.startingState)
        || Objects.isNull(this.event)
        || Objects.isNull(this.endingState)) {
      throw new StateTransitionActionException("Incomplete state transition");
    }
    if (!this.transitions.containsKey(this.startingState)) {
      this.transitions.put(this.startingState, new EnumMap<>(this.eventClass));
    }
    this.transitions
        .get(this.startingState)
        .put(this.event, new StateDescription<S, T>(this.endingState, this.guard, this.action));
    this.startingState = null;
    this.event = null;
    this.guard = null;
    this.endingState = null;
    this.action = null;
    return this;
  }
}
