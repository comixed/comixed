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
import org.comixedproject.model.lists.Story;
import org.comixedproject.model.lists.StoryState;
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
 * <code>StoryStateHandler</code> handles firing actions and notifying listeners for state changes
 * on {@link Story} instances.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class StoryStateHandler extends LifecycleObjectSupport {
  public static final String HEADER_STORY = "Story";

  @Autowired private StateMachine<StoryState, StoryEvent> stateMachine;

  private Set<StoryStateChangeListener> listeners = new HashSet<>();

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
                          final State<StoryState, StoryEvent> state,
                          final Message<StoryEvent> message,
                          final Transition<StoryState, StoryEvent> transition,
                          final StateMachine<StoryState, StoryEvent> stateMachine,
                          final StateMachine<StoryState, StoryEvent> rootStateMachine) {
                        listeners.forEach(listener -> listener.onStoryStateChange(state, message));
                      }
                    }));
  }

  /**
   * Adds a listener.
   *
   * @param listener the listener
   */
  public void addListener(final StoryStateChangeListener listener) {
    log.debug("Adding listener: {}", listener);
    this.listeners.add(listener);
  }

  /**
   * Initiates a state event.
   *
   * @param story the story
   * @param event the event
   */
  public void fireEvent(final Story story, final StoryEvent event) {
    this.fireEvent(story, event, Collections.emptyMap());
  }

  /**
   * Initiates a state event.
   *
   * @param story the story
   * @param event the event
   * @param headers the event headers
   */
  public void fireEvent(final Story story, final StoryEvent event, Map<String, ?> headers) {
    log.debug("Firing story event: {} => {}", story.getId(), event);
    final Message<StoryEvent> message =
        MessageBuilder.withPayload(event)
            .copyHeaders(headers)
            .setHeader(HEADER_STORY, story)
            .build();
    this.stateMachine.stop();
    this.stateMachine
        .getStateMachineAccessor()
        .doWithAllRegions(
            access ->
                access.resetStateMachine(
                    new DefaultStateMachineContext<>(story.getStoryState(), null, null, null)));
    this.stateMachine.start();
    this.stateMachine.sendEvent(message);
  }
}
