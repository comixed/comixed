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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.library.LibraryState;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>LibraryStateService</code> provide business methods for working with the state of the
 * library.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class LibraryStateService {
  @Autowired private ComicBookService comicBookService;

  /**
   * Returns the current state of the library.
   *
   * @return the state
   */
  public LibraryState getLibraryState() {
    log.debug("Retrieving the library state");
    final LibraryState result =
        new LibraryState(
            this.comicBookService.getComicBookCount(),
            this.comicBookService.getDeletedComicCount());
    result.setPublishers(this.comicBookService.getPublishersState());
    result.setSeries(this.comicBookService.getSeriesState());
    result.setCharacters(this.comicBookService.getCharactersState());
    result.setTeams(this.comicBookService.getTeamsState());
    result.setLocations(this.comicBookService.getLocationsState());
    result.setStories(this.comicBookService.getStoriesState());
    result.setStates(this.comicBookService.getComicBooksState());
    return result;
  }
}
