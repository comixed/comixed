/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.state.StateMachine;
import org.comixedproject.state.comicbooks.actions.*;
import org.comixedproject.state.comicbooks.guards.MarkComicAsFoundGuard;
import org.comixedproject.state.comicbooks.guards.MarkComicAsMissingGuard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <code>ComicBookStateMachineConfiguration</code> defines a state machine for instances of {@link
 * ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@Log4j2
public class ComicBookStateMachineConfiguration {
  public static final String COMIC_STATE_MACHINE = "comicStateMachine";

  @Autowired private PrepareComicForProcessingAction prepareComicForProcessingAction;
  @Autowired private FileContentsLoadedAction fileContentsLoadedAction;
  @Autowired private MetadataSavedAction metadataSavedAction;
  @Autowired private PrepareComicBooksForBatchEditingAction prepareComicBooksForBatchEditingAction;
  @Autowired private ComicFileRecreatedAction comicFileRecreatedAction;
  @Autowired private MarkComicAsMissingGuard markComicAsMissingGuard;
  @Autowired private MarkComicAsMissingAction markComicAsMissingAction;
  @Autowired private MarkComicAsFoundGuard markComicAsFoundGuard;
  @Autowired private MarkComicAsFoundAction markComicAsFoundAction;
  @Autowired private UnmarkComicForRemovalAction unmarkComicForRemovalAction;

  @Bean(name = COMIC_STATE_MACHINE)
  public StateMachine<ComicBook, ComicState, ComicEvent> comicStateMachine() {
    final StateMachine<ComicBook, ComicState, ComicEvent> stateMachine =
        new StateMachine<>(ComicState.class, ComicEvent.class);

    return stateMachine
        // discovered comics
        .startingState(ComicState.CREATED)
        .onEvent(ComicEvent.comicFileDiscovered)
        .endingState(ComicState.DISCOVERED)
        .and()
        .startingState(ComicState.DISCOVERED)
        .onEvent(ComicEvent.comicBookImported)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.prepareComicForProcessingAction)
        .and()
        // imported comics
        .startingState(ComicState.CREATED)
        .onEvent(ComicEvent.comicBookImported)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.prepareComicForProcessingAction)
        .and()
        // unprocessed comics
        .startingState(ComicState.UNPROCESSED)
        .onEvent(ComicEvent.comicFileContentsLoaded)
        .endingState(ComicState.STABLE)
        .withAction(this.fileContentsLoadedAction)
        .and()
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicFileContentsLoaded)
        .endingState(ComicState.STABLE)
        .withAction(this.fileContentsLoadedAction)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicFileContentsLoaded)
        .endingState(ComicState.STABLE)
        .withAction(this.fileContentsLoadedAction)
        .and()
        // missing comics
        .startingState(ComicState.UNPROCESSED)
        .onEvent(ComicEvent.comicFileMissing)
        .afterGuard(this.markComicAsMissingGuard)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.markComicAsMissingAction)
        .and()
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicFileMissing)
        .afterGuard(this.markComicAsMissingGuard)
        .endingState(ComicState.STABLE)
        .withAction(this.markComicAsMissingAction)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicFileMissing)
        .afterGuard(this.markComicAsMissingGuard)
        .endingState(ComicState.CHANGED)
        .withAction(this.markComicAsMissingAction)
        .and()
        // found comics
        .startingState(ComicState.UNPROCESSED)
        .onEvent(ComicEvent.comicFileFound)
        .afterGuard(this.markComicAsFoundGuard)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.markComicAsFoundAction)
        .and()
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicFileFound)
        .afterGuard(this.markComicAsFoundGuard)
        .endingState(ComicState.STABLE)
        .withAction(this.markComicAsFoundAction)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicFileFound)
        .afterGuard(this.markComicAsFoundGuard)
        .endingState(ComicState.CHANGED)
        .withAction(this.markComicAsFoundAction)
        .and()
        // prepare for batch metadata editing
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.prepareComicsForBatchEditing)
        .endingState(ComicState.STABLE)
        .withAction(this.prepareComicBooksForBatchEditingAction)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.prepareComicsForBatchEditing)
        .endingState(ComicState.CHANGED)
        .withAction(this.prepareComicBooksForBatchEditingAction)
        .and()
        // metadata was cleared
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicMetadataCleared)
        .endingState(ComicState.CHANGED)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicMetadataCleared)
        .endingState(ComicState.CHANGED)
        .and()
        // metadata changed
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicMetadataChanged)
        .endingState(ComicState.CHANGED)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicMetadataChanged)
        .endingState(ComicState.CHANGED)
        .and()
        // metadata saved
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicMetadataSaved)
        .endingState(ComicState.STABLE)
        .withAction(this.metadataSavedAction)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicMetadataSaved)
        .endingState(ComicState.STABLE)
        .withAction(this.metadataSavedAction)
        .and()
        // recreate file
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicFileRecreated)
        .withAction(this.comicFileRecreatedAction)
        .endingState(ComicState.UNPROCESSED)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicFileRecreated)
        .withAction(this.comicFileRecreatedAction)
        .endingState(ComicState.UNPROCESSED)
        .and()
        // rescan file
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.rescanComicBookFile)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.prepareComicForProcessingAction)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.rescanComicBookFile)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.prepareComicForProcessingAction)
        .and()
        // page hashes loaded
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.comicPageHashesLoaded)
        .endingState(ComicState.STABLE)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.comicPageHashesLoaded)
        .endingState(ComicState.CHANGED)
        .and()
        // marked for removal
        .startingState(ComicState.DISCOVERED)
        .onEvent(ComicEvent.markComicForRemoval)
        .endingState(ComicState.DELETED)
        .and()
        .startingState(ComicState.UNPROCESSED)
        .onEvent(ComicEvent.markComicForRemoval)
        .endingState(ComicState.DELETED)
        .and()
        .startingState(ComicState.STABLE)
        .onEvent(ComicEvent.markComicForRemoval)
        .endingState(ComicState.DELETED)
        .and()
        .startingState(ComicState.CHANGED)
        .onEvent(ComicEvent.markComicForRemoval)
        .endingState(ComicState.DELETED)
        .and()
        // unmarked for removal
        .startingState(ComicState.DELETED)
        .onEvent(ComicEvent.unmarkComicForRemoval)
        .endingState(ComicState.UNPROCESSED)
        .withAction(this.unmarkComicForRemovalAction)
        .and()
        // removed comic
        .startingState(ComicState.DELETED)
        .onEvent(ComicEvent.comicFileDeleted)
        .endingState(ComicState.REMOVED)
        .build();
  }
}
