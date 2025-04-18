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

package org.comixedproject.state.comicpages;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import lombok.Synchronized;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
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
 * <code>ComicPageStateHandler</code> handles firing actions and notifying listeners for state
 * changes to {@link ComicPage} objectes.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class ComicPageStateHandler extends LifecycleObjectSupport {
  public static final String HEADER_PAGE = "header.page";
  @Autowired private StateMachine<ComicPageState, ComicPageEvent> stateMachine;

  private Set<ComicPageStateChangeListener> listeners = new HashSet<>();

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
                          final State<ComicPageState, ComicPageEvent> state,
                          final Message<ComicPageEvent> message,
                          final Transition<ComicPageState, ComicPageEvent> transition,
                          final StateMachine<ComicPageState, ComicPageEvent> stateMachine,
                          final StateMachine<ComicPageState, ComicPageEvent> rootStateMachine) {
                        listeners.forEach(listener -> listener.onPageStateChange(state, message));
                      }
                    }));
  }

  /**
   * Adds a listener.
   *
   * @param listener the listener
   */
  public void addListener(final ComicPageStateChangeListener listener) {
    log.debug("Adding listener: {}", listener);
    this.listeners.add(listener);
  }

  /**
   * Initiates a state event.
   *
   * @param page the page
   * @param event the event
   */
  public void fireEvent(final ComicPage page, final ComicPageEvent event) {
    this.fireEvent(page, event, Collections.emptyMap());
  }

  /**
   * Initiates a state event.
   *
   * @param page the page
   * @param event the event
   * @param headers the message headers
   */
  @Synchronized
  public void fireEvent(
      final ComicPage page, final ComicPageEvent event, final Map<String, String> headers) {
    log.debug("Firing page event: {} => {}", page.getComicPageId(), event);
    final Message<ComicPageEvent> message =
        MessageBuilder.withPayload(event).copyHeaders(headers).setHeader(HEADER_PAGE, page).build();
    this.stateMachine
        .getStateMachineAccessor()
        .doWithAllRegions(
            access ->
                access.resetStateMachine(
                    new DefaultStateMachineContext<>(page.getPageState(), null, null, null)));
    this.stateMachine.start();
    this.stateMachine.sendEvent(message);
  }
}
