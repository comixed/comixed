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

import java.util.HashSet;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>LibrarySelectionService</code> provides business functions for managing a user's selection
 * of comics.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class LibrarySelectionService {
  @Autowired private ComicBookService comicBookService;

  /**
   * Updates the list of selected comics based on the incoming request. If the request is adding,
   * then the set is updated. Otherwise, any matches found are removed. The updated set of ids is
   * returned.
   *
   * @param existing the existing selections
   * @param incoming the incoming selections
   * @param adding true when adding selections
   * @return the updated selections
   * @throws LibrarySelectionException if an error occurs
   */
  public Set<Long> selectComics(
      final Set<Long> existing, final Set<Long> incoming, final boolean adding)
      throws LibrarySelectionException {
    Set<Long> result = existing;
    if (result == null) {
      log.trace("Creating new selection set");
      result = new HashSet<>();
    }
    if (adding) {
      log.debug(
          "Adding {} comic{} from selection set", incoming.size(), incoming.size() == 1 ? "" : "s");
      for (final Long idIterator : incoming) {
        final Long id = idIterator;
        try {
          log.trace("Loading comic book: id={}", id);
          final ComicBook comicBook = this.comicBookService.getComic(id);
          log.trace("Adding comic book to selections");
          result.add(comicBook.getId());
        } catch (ComicException error) {
          throw new LibrarySelectionException("Failed to load comic: id=" + id, error);
        }
      }
      return result;
    } else {
      if (existing == null || existing.isEmpty()) {
        log.debug("No existing selections to remove");
        return existing;
      }

      for (final Long idIterator : incoming) {
        final Long id = idIterator;
        log.trace("removing comic book from selections: id={}", id);
        existing.remove(id);
      }
      return existing;
    }
  }
}
