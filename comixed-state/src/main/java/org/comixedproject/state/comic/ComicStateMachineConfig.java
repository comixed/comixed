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

package org.comixedproject.state.comic;

import java.util.EnumSet;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicState;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>ComicStateMachineConfig</code> provides a state machine configuration to manage the state
 * for instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine
public class ComicStateMachineConfig
    extends EnumStateMachineConfigurerAdapter<ComicState, ComicEvent> {
  @Override
  public void configure(final StateMachineStateConfigurer<ComicState, ComicEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(ComicState.ADDED)
        .end(ComicState.DELETED)
        .states(EnumSet.allOf(ComicState.class));
  }

  @Override
  public void configure(final StateMachineTransitionConfigurer<ComicState, ComicEvent> transitions)
      throws Exception {
    transitions
        // newly added comic is processed
        .withExternal()
        .source(ComicState.ADDED)
        .target(ComicState.STABLE)
        .event(ComicEvent.contentsProcessed)
        // the comic archive was recreated
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.archiveRecreated)
        // the comic details are manually changed
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.detailsUpdated)
        // the comic details are changed via scraping
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.scraped)
        // the comic details are manually changed
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.detailsUpdated)
        // the comic details are cahnged via scraping
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.scraped)
        // the comicinfo.xml file was updated
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.STABLE)
        .event(ComicEvent.comicInfoUpdated)
        // the comic archive was recreated
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.STABLE)
        .event(ComicEvent.archiveRecreated)
        // the comic file was reprocessed and the database details overwritten
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.STABLE)
        .event(ComicEvent.contentsProcessed)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.DELETED)
        .event(ComicEvent.markForDeletion)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.DELETED)
        .event(ComicEvent.markForDeletion)
        // the comic was unmarked for deletion
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.ADDED)
        .event(ComicEvent.unmarkFromDeletion);
  }
}
