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

import java.util.EnumSet;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.comicbooks.actions.*;
import org.comixedproject.state.comicbooks.guards.MarkComicAsFoundGuard;
import org.comixedproject.state.comicbooks.guards.MarkComicAsMissingGuard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

/**
 * <code>ComicStateMachineConfiguration</code> provides a state machine configuration to manage the
 * state for instances of {@link ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@EnableStateMachine(name = "comixedStateMachine")
public class ComicStateMachineConfiguration
    extends EnumStateMachineConfigurerAdapter<ComicState, ComicEvent> {
  @Autowired private PrepareComicForProcessingAction prepareComicForProcessingAction;
  @Autowired private FileContentsLoadedAction fileContentsLoadedAction;
  @Autowired private MetadataUpdatedAction metadataUpdatedAction;
  @Autowired private UpdateComicBookDetailsAction updateComicBookDetailsAction;
  @Autowired private ComicBookDetailsUpdatedAction comicBookDetailsUpdatedAction;
  @Autowired private ComicFileRecreatedAction comicFileRecreatedAction;
  @Autowired private MarkComicAsMissingGuard markComicAsMissingGuard;
  @Autowired private MarkComicAsMissingAction markComicAsMissingAction;
  @Autowired private MarkComicAsFoundGuard markComicAsFoundGuard;
  @Autowired private MarkComicAsFoundAction markComicAsFoundAction;

  @Override
  public void configure(final StateMachineStateConfigurer<ComicState, ComicEvent> states)
      throws Exception {
    states
        .withStates()
        .initial(ComicState.CREATED)
        .end(ComicState.REMOVED)
        .states(EnumSet.allOf(ComicState.class));
  }

  @Override
  public void configure(final StateMachineTransitionConfigurer<ComicState, ComicEvent> transitions)
      throws Exception {
    transitions
        // created
        .withExternal()
        .source(ComicState.CREATED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.readyForProcessing)
        // rescan a stable comic
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.rescanComic)
        .action(prepareComicForProcessingAction)
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.rescanComic)
        .action(prepareComicForProcessingAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.rescanComic)
        .action(prepareComicForProcessingAction)
        // the comic file contents have been loaded
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.STABLE)
        .event(ComicEvent.fileContentsLoaded)
        .action(fileContentsLoadedAction)
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.fileContentsLoaded)
        .action(fileContentsLoadedAction)
        // the details are going to be edited
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.updateDetails)
        .action(updateComicBookDetailsAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.updateDetails)
        .action(updateComicBookDetailsAction)
        // the comic details have been edited
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.detailsUpdated)
        .action(comicBookDetailsUpdatedAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.detailsUpdated)
        .action(comicBookDetailsUpdatedAction)
        // the comic details are changed via scraping
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.scraped)
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
        // the metadata was updated
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.metadataUpdated)
        .action(metadataUpdatedAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.STABLE)
        .event(ComicEvent.metadataUpdated)
        .action(metadataUpdatedAction)
        // the comic archive was recreated
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.comicFileRecreated)
        .action(comicFileRecreatedAction)
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.comicFileRecreated)
        .action(comicFileRecreatedAction)
        // the comic file was not found
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.markAsMissing)
        .guard(markComicAsMissingGuard)
        .action(markComicAsMissingAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.markAsMissing)
        .guard(markComicAsMissingGuard)
        .action(markComicAsMissingAction)
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.DELETED)
        .event(ComicEvent.markAsMissing)
        .guard(markComicAsMissingGuard)
        .action(markComicAsMissingAction)
        // the comic file was found
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.markAsFound)
        .guard(markComicAsFoundGuard)
        .action(markComicAsFoundAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.markAsFound)
        .guard(markComicAsFoundGuard)
        .action(markComicAsFoundAction)
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.DELETED)
        .event(ComicEvent.markAsFound)
        .guard(markComicAsFoundGuard)
        .action(markComicAsFoundAction)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.DELETED)
        .event(ComicEvent.deleteComic)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.DELETED)
        .event(ComicEvent.deleteComic)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.DELETED)
        .event(ComicEvent.deleteComic)
        // the comic was unmarked for deletion
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.undeleteComic)
        // the comic record was actually deleted
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.REMOVED)
        .event(ComicEvent.comicPurged);
  }
}
