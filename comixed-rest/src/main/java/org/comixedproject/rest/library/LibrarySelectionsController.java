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

package org.comixedproject.rest.library;

import io.micrometer.core.annotation.Timed;
import java.util.Set;
import javax.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.library.SelectComicBooksRequest;
import org.comixedproject.service.library.LibrarySelectionException;
import org.comixedproject.service.library.LibrarySelectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>LibrarySelectionsController</code> provides REST APIs for working with selections made by
 * users.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LibrarySelectionsController {
  public static final String LIBRARY_SELECTIONS = "library.selection";

  @Autowired private LibrarySelectionService librarySelectionService;

  /**
   * Called when selection changes are being made.
   *
   * @param httpSession the session
   * @param request the request body
   * @return the list of selected comic ids
   * @throws LibrarySelectionException if an error occurs
   */
  @PostMapping(
      value = "/api/library/selections",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.selections.add")
  public Set<Long> selectComicBooks(
      final HttpSession httpSession, @RequestBody() final SelectComicBooksRequest request)
      throws LibrarySelectionException {
    final Set<Long> ids = request.getIds();
    final boolean adding = request.getAdding();
    log.info(
        "Updating comic selections: {} id{} being {}",
        ids.size(),
        ids.size() == 1 ? "" : "s",
        adding ? "added" : "removed");
    final Set<Long> existingIds = (Set<Long>) httpSession.getAttribute(LIBRARY_SELECTIONS);
    final Set<Long> result = this.librarySelectionService.selectComics(existingIds, ids, adding);
    httpSession.setAttribute(LIBRARY_SELECTIONS, result);
    return result;
  }

  /**
   * Clears the selections for the current user.
   *
   * @param httpSession the session
   */
  @DeleteMapping(value = "/api/library/selections")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.selections.clear")
  public void clearSelections(final HttpSession httpSession) {
    log.info("Clearing comic selections");
    httpSession.setAttribute(LIBRARY_SELECTIONS, null);
  }
}
