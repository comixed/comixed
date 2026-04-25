/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.service.library;

import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.library.PublishRemoteLibraryUpdateAction;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.library.RemoteLibraryState;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.state.comicbooks.ComicBookStateAdaptor;
import org.comixedproject.state.comicbooks.ComicStateChangeListener;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>RemoteLibraryStateService</code> provide business methods for working with the state of the
 * library.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class RemoteLibraryStateService implements InitializingBean, ComicStateChangeListener {
  @Autowired private ComicBookStateAdaptor comicBookStateAdaptor;
  @Autowired private ComicBookService comicBookService;
  @Autowired private DuplicateComicService duplicateComicService;
  @Autowired private PublishRemoteLibraryUpdateAction publishRemoteLibraryUpdateAction;

  @Override
  public void afterPropertiesSet() throws Exception {
    log.debug("Subscribing to comic book state changes");
    this.comicBookStateAdaptor.addListener(this);
  }

  @Override
  public void onComicStateChanged(final @NonNull ComicBook comicBook) {
    log.debug("Publishing library state update");
    try {
      this.publishRemoteLibraryUpdateAction.publish(this.getLibraryState());
    } catch (PublishingException error) {
      log.error("Failed to publish library state update", error);
    }
  }

  /**
   * Returns the current state of the library.
   *
   * @return the state
   */
  public RemoteLibraryState getLibraryState() {
    log.debug("Retrieving the library state");
    final RemoteLibraryState result =
        new RemoteLibraryState(
            this.comicBookService.getComicBookCount(),
            this.comicBookService.getUnscrapedComicCount(),
            this.comicBookService.getDeletedComicCount(),
            this.duplicateComicService.getDuplicateComicBookCount());
    result.setPublishers(this.comicBookService.getPublishersState());
    result.setSeries(this.comicBookService.getSeriesState());
    result.setCharacters(this.comicBookService.getCharactersState());
    result.setTeams(this.comicBookService.getTeamsState());
    result.setLocations(this.comicBookService.getLocationsState());
    result.setStories(this.comicBookService.getStoriesState());
    result.setStates(this.comicBookService.getComicBooksState());
    result.setByPublisherAndYear(this.comicBookService.getByPublisherAndYear());
    return result;
  }
}
