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

package org.comixedproject.state.lists;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.state.State;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.statemachine.support.LifecycleObjectSupport;
import org.springframework.statemachine.support.StateMachineInterceptorAdapter;
import org.springframework.statemachine.transition.Transition;
import org.springframework.stereotype.Component;

/**
 * <code>ReadingListStateHandler</code> handles firing actions and notifying listeners for state
 * changes on {@link ReadingList} instances.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ReadingListStateHandler extends LifecycleObjectSupport {
  public static final String HEADER_READING_LIST = "ReadingList";

  @Autowired private StateMachine<ReadingListState, ReadingListEvent> stateMachine;

  private Set<ReadingListStateChangeListener> listeners = new HashSet<>();

  @Override
  protected void onInit() throws Exception {
    this.stateMachine
        .getStateMachineAccessor()
        .doWithAllRegions(
            function ->
                function.addStateMachineInterceptor(
                    new StateMachineInterceptorAdapter<>() {
                      @Override
                      public void postStateChange(
                          final State<ReadingListState, ReadingListEvent> state,
                          final Message<ReadingListEvent> message,
                          final Transition<ReadingListState, ReadingListEvent> transition,
                          final StateMachine<ReadingListState, ReadingListEvent> stateMachine,
                          final StateMachine<ReadingListState, ReadingListEvent> rootStateMachine) {
                        listeners.forEach(
                            listener -> listener.onReadingListStateChange(state, message));
                      }
                    }));
  }

  /**
   * Adds a listener.
   *
   * @param listener the listener
   */
  public void addListener(final ReadingListStateChangeListener listener) {
    log.debug("Adding listener: {}", listener);
    this.listeners.add(listener);
  }

  /**
   * Initiates a state event.
   *
   * @param readingList the reading list
   * @param event the event
   */
  public void fireEvent(final ReadingList readingList, final ReadingListEvent event) {
    this.fireEvent(readingList, event, Collections.emptyMap());
  }

  /**
   * Initiates a state event.
   *
   * @param readingList the reading list
   * @param event the event
   * @param headers the event headers
   */
  public void fireEvent(
      final ReadingList readingList, final ReadingListEvent event, Map<String, ?> headers) {
    log.debug("Firing reading list event: {} => {}", readingList.getId(), event);
    final Message<ReadingListEvent> message =
        MessageBuilder.withPayload(event)
            .copyHeaders(headers)
            .setHeader(HEADER_READING_LIST, readingList)
            .build();
    this.stateMachine.stop();
    this.stateMachine
        .getStateMachineAccessor()
        .doWithAllRegions(
            access ->
                access.resetStateMachine(
                    new DefaultStateMachineContext<>(
                        readingList.getReadingListState(), null, null, null)));
    this.stateMachine.start();
    this.stateMachine.sendEvent(message);
  }
}
