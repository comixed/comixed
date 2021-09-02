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
import org.comixedproject.model.lists.ReadingList;
import org.comixedproject.model.lists.ReadingListState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>ReadingListStateMachineConfig</code> provides a state machine configuration to manage the
 * state for instances of {@link ReadingList}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine(name = "readingListStateMachine")
public class ReadingListStateMachineConfig
    extends EnumStateMachineConfigurerAdapter<ReadingListState, ReadingListEvent> {
  @Override
  public void configure(
      final StateMachineStateConfigurer<ReadingListState, ReadingListEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(ReadingListState.STABLE)
        .end(ReadingListState.DELETED)
        .states(EnumSet.allOf(ReadingListState.class));
  }

  @Override
  public void configure(
      final StateMachineTransitionConfigurer<ReadingListState, ReadingListEvent> transitions)
      throws Exception {
    transitions
        // the reading list has been updated
        .withExternal()
        .source(ReadingListState.STABLE)
        .target(ReadingListState.STABLE)
        .event(ReadingListEvent.updated)
        // comics have been added to the reading list
        .and()
        .withExternal()
        .source(ReadingListState.STABLE)
        .target(ReadingListState.STABLE)
        .event(ReadingListEvent.comicAdded)
        // comics have been removed from the reading list
        .and()
        .withExternal()
        .source(ReadingListState.STABLE)
        .target(ReadingListState.STABLE)
        .event(ReadingListEvent.comicRemoved)
        // the reading list has been deleted
        .and()
        .withExternal()
        .source(ReadingListState.STABLE)
        .target(ReadingListState.DELETED)
        .event(ReadingListEvent.deleted);
  }
}
