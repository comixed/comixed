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

import java.util.EnumSet;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.comicpages.ComicPageState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>ComicPageStateMachineConfiguration</code> defines the state machine for instances of {@link
 * ComicPage}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine(name = "pageStateMachine")
public class ComicPageStateMachineConfiguration
    extends EnumStateMachineConfigurerAdapter<ComicPageState, ComicPageEvent> {
  @Override
  public void configure(final StateMachineStateConfigurer<ComicPageState, ComicPageEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(ComicPageState.STABLE)
        .end(ComicPageState.REMOVED)
        .states(EnumSet.allOf(ComicPageState.class));
  }

  @Override
  public void configure(
      final StateMachineTransitionConfigurer<ComicPageState, ComicPageEvent> transitions)
      throws Exception {
    transitions
        // a page is saved
        .withExternal()
        .source(ComicPageState.STABLE)
        .target(ComicPageState.STABLE)
        .event(ComicPageEvent.savePage)
        // a page is marked for deletion
        .and()
        .withExternal()
        .source(ComicPageState.STABLE)
        .target(ComicPageState.DELETED)
        .event(ComicPageEvent.markForDeletion)
        // a page is unmarked for deletion
        .and()
        .withExternal()
        .source(ComicPageState.DELETED)
        .target(ComicPageState.STABLE)
        .event(ComicPageEvent.unmarkForDeletion);
  }
}
