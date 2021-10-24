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

package org.comixedproject.state.comicbooks;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
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
 * <code>ComicStateHandler</code> handles firing actions and notifying listeners for state changes
 * on {@link Comic} instances.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicStateHandler extends LifecycleObjectSupport {
  public static final String HEADER_COMIC = "header.comic";
  public static final String HEADER_DELETE_REMOVED_COMIC_FILE = "header.remove-comic-file";
  public static final String HEADER_TARGET_DIRECTORY = "header.target-directory";
  public static final String HEADER_RENAMING_RULE = "header.renaming-rule";
  public static final String HEADER_USER = "header.user";

  @Autowired private StateMachine<ComicState, ComicEvent> stateMachine;

  private Set<ComicStateChangeListener> listeners = new HashSet<>();

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
                          final State<ComicState, ComicEvent> state,
                          final Message<ComicEvent> message,
                          final Transition<ComicState, ComicEvent> transition,
                          final StateMachine<ComicState, ComicEvent> stateMachine,
                          final StateMachine<ComicState, ComicEvent> rootStateMachine) {
                        listeners.forEach(listener -> listener.onComicStateChange(state, message));
                      }
                    }));
  }

  /**
   * Adds a listener.
   *
   * @param listener the listener
   */
  public void addListener(final ComicStateChangeListener listener) {
    log.debug("Adding listener: {}", listener);
    this.listeners.add(listener);
  }

  /**
   * Initiates a state event.
   *
   * @param comic the comic
   * @param event the event
   */
  public void fireEvent(final Comic comic, final ComicEvent event) {
    this.fireEvent(comic, event, Collections.emptyMap());
  }

  /**
   * Initiates a state event.
   *
   * @param comic the comic
   * @param event the event
   * @param headers the message headers
   */
  public void fireEvent(
      final Comic comic, final ComicEvent event, final Map<String, Object> headers) {
    log.debug("Firing comic event: {} => {}", comic.getId(), event);
    final Message<ComicEvent> message =
        MessageBuilder.withPayload(event)
            .copyHeaders(headers)
            .setHeader(HEADER_COMIC, comic)
            .build();
    this.stateMachine.stop();
    this.stateMachine
        .getStateMachineAccessor()
        .doWithAllRegions(
            access ->
                access.resetStateMachine(
                    new DefaultStateMachineContext<>(comic.getComicState(), null, null, null)));
    this.stateMachine.start();
    this.stateMachine.sendEvent(message);
  }
}
