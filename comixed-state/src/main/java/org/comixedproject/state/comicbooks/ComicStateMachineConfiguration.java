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
import org.comixedproject.state.comicbooks.guards.*;
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
@EnableStateMachine(name = "comicStateMachine")
public class ComicStateMachineConfiguration
    extends EnumStateMachineConfigurerAdapter<ComicState, ComicEvent> {
  @Autowired private PrepareComicForProcessingAction prepareComicForProcessingAction;
  @Autowired private FileContentsLoadedAction fileContentsLoadedAction;
  @Autowired private MetadataSourceCreatedAction metadataSourceCreatedAction;
  @Autowired private BlockedPagesMarkedAction blockedPagesMarkedAction;
  @Autowired private ComicContentsProcessedGuard comicContentsProcessedGuard;
  @Autowired private UpdateMetadataAction updateMetadataAction;
  @Autowired private MetadataUpdatedAction metadataUpdatedAction;
  @Autowired private ComicConsolidatedAction comicConsolidatedAction;
  @Autowired private UpdateComicBookDetailsAction updateComicBookDetailsAction;
  @Autowired private ComicBookDetailsUpdatedAction comicBookDetailsUpdatedAction;
  @Autowired private ComicFileRecreatedAction comicFileRecreatedAction;
  @Autowired private PrepareToPurgeComicAction prepareToPurgeComicAction;

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
        .withExternal()
        .source(ComicState.ADDED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.recordInserted)
        // newly added comic is reading to be imported
        .and()
        .withExternal()
        .source(ComicState.ADDED)
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.readyForProcessing)
        .action(prepareComicForProcessingAction)
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
        .target(ComicState.UNPROCESSED)
        .event(ComicEvent.metadataSourceCreated)
        .action(metadataSourceCreatedAction)
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
        // all comic content has been processed
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.STABLE)
        .event(ComicEvent.contentsProcessed)
        .guard(comicContentsProcessedGuard)
        // the comic file was reprocessed and the database details overwritten
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.STABLE)
        .event(ComicEvent.contentsProcessed)
        // the comic was consolidated
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.comicConsolidated)
        .action(comicConsolidatedAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.comicConsolidated)
        .action(comicConsolidatedAction)
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
        // start updating the metadata
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.CHANGED)
        .event(ComicEvent.updateMetadata)
        .action(updateMetadataAction)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.updateMetadata)
        .action(updateMetadataAction)
        // the metadata was updated
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
        // the comic has been marked as read
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.markAsRead)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.markAsRead)
        // the comic has been marked as unread
        .and()
        .withExternal()
        .source(ComicState.STABLE)
        .target(ComicState.STABLE)
        .event(ComicEvent.markAsUnread)
        .and()
        .withExternal()
        .source(ComicState.CHANGED)
        .target(ComicState.CHANGED)
        .event(ComicEvent.markAsUnread)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.UNPROCESSED)
        .target(ComicState.DELETED)
        .event(ComicEvent.deleteComic)
        // the comic was marked for deletion
        .and()
        .withExternal()
        .source(ComicState.ADDED)
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
        // the comic is being purged from the library
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.DELETED)
        .event(ComicEvent.prepareToPurge)
        .action(prepareToPurgeComicAction)
        // the comic record was actually deleted
        .and()
        .withExternal()
        .source(ComicState.DELETED)
        .target(ComicState.REMOVED)
        .event(ComicEvent.comicPurged);
  }
}
