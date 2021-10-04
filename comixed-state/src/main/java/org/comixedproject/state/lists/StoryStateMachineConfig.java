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

import java.util.EnumSet;
import org.comixedproject.model.lists.Story;
import org.comixedproject.model.lists.StoryState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>StoryStateMachineConfig</code> provides a state machine configuration to manage a {@link
 * Story} throw its lifecycle.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine(name = "storyStateMachine")
public class StoryStateMachineConfig
    extends EnumStateMachineConfigurerAdapter<StoryState, StoryEvent> {
  @Override
  public void configure(final StateMachineStateConfigurer<StoryState, StoryEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(StoryState.STABLE)
        .end(StoryState.DELETED)
        .states(EnumSet.allOf(StoryState.class));
  }

  @Override
  public void configure(final StateMachineTransitionConfigurer<StoryState, StoryEvent> transitions)
      throws Exception {
    transitions
        .withExternal()
        .source(StoryState.CREATED)
        .target(StoryState.STABLE)
        .event(StoryEvent.saved);
  }
}
