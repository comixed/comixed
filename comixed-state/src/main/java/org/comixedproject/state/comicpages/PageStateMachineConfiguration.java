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
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.comicpages.PageState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>PageStateMachineConfiguration</code> defines the state machine for instances of {@link
 * Page}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine(name = "pageStateMachine")
public class PageStateMachineConfiguration
    extends EnumStateMachineConfigurerAdapter<PageState, PageEvent> {
  @Override
  public void configure(final StateMachineStateConfigurer<PageState, PageEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(PageState.STABLE)
        .end(PageState.REMOVED)
        .states(EnumSet.allOf(PageState.class));
  }

  @Override
  public void configure(final StateMachineTransitionConfigurer<PageState, PageEvent> transitions)
      throws Exception {
    transitions
        // a page is saved
        .withExternal()
        .source(PageState.STABLE)
        .target(PageState.STABLE)
        .event(PageEvent.savePage)
        // a page is marked for deletion
        .and()
        .withExternal()
        .source(PageState.STABLE)
        .target(PageState.DELETED)
        .event(PageEvent.markForDeletion)
        // a page is unmarked for deletion
        .and()
        .withExternal()
        .source(PageState.DELETED)
        .target(PageState.STABLE)
        .event(PageEvent.unmarkForDeletion);
  }
}
