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
import org.comixedproject.state.comic.actions.*;
import org.comixedproject.state.comic.guards.ComicContentsProcessedGuard;
import org.comixedproject.state.comic.guards.FileDetailsCreatedGuard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>ComicStateMachineConfiguration</code> provides a state machine configuration to manage the
 * state for instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine(name = "comicStateMachine")
public class ComicStateMachineConfiguration
    extends EnumStateMachineConfigurerAdapter<ComicState, ComicEvent> {
  @Autowired private PrepareComicForProcessingAction prepareComicForProcessingAction;
  @Autowired private FileContentsLoadedAction fileContentsLoadedAction;
  @Autowired private BlockedPagesMarkedAction blockedPagesMarkedAction;
  @Autowired private FileDetailsCreatedGuard fileDetailsCreatedGuard;
  @Autowired private ComicContentsProcessedGuard comicContentsProcessedGuard;
  @Autowired private MarkComicForRemovalAction markComicForRemovalAction;
  @Autowired private UnmarkComicForRemovalAction unmarkComicForRemovalAction;

  @Override
  public void configure(final StateMachineStateConfigurer<ComicState, ComicEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(ComicState.ADDED)
        .end(ComicState.REMOVED)
        .states(EnumSet.allOf(ComicState.class));
  }

  @Override
  public void configure(final StateMachineTransitionConfigurer<ComicState, ComicEvent> transitions)
      throws Exception {
    transitions
        // newly added comic is imported
        .withExternal()
        .source(ComicState.ADDED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.imported)
        .action(prepareComicForProcessingAction)
        // the comic file contents have been loaded
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.fileContentsLoaded)
        .action(fileContentsLoadedAction)
        // the blocked pages have been marked for deletion
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.blockedPagesMarked)
        .action(blockedPagesMarkedAction)
        // the file details have been created
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.fileDetailsCreatedAction)
        .guard(fileDetailsCreatedGuard)
        // all comic content has been processed
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.STABLE)
        .event(ComicEvent.contentsProcessed)
        .guard(comicContentsProcessedGuard)
        // the comic archive was recreated
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.archiveRecreated)
        // the comic was physically moved
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.comicMoved)
        // the comic was physically moved
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.comicMoved)
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
        // the comic details are change via scraping
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.scraped)
        // the metadata for a stable comic are cleared
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.metadataCleared)
        // the metadata for a changed comic are cleared
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.metadataCleared)
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
        .source(ComicState.ADDED)
        .target(ComicState.DELETED)
        .event(ComicEvent.markedForRemoval)
        .action(markComicForRemovalAction)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.DELETED)
        .event(ComicEvent.markedForRemoval)
        .action(markComicForRemovalAction)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.DELETED)
        .event(ComicEvent.markedForRemoval)
        .action(markComicForRemovalAction)
        // the comic was unmarked for deletion
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.ADDED)
        .event(ComicEvent.unmarkedForRemoval)
        .action(unmarkComicForRemovalAction);
  }
}
