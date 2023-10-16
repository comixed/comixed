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

package org.comixedproject.rest.comicbooks;

import io.micrometer.core.annotation.Timed;
import java.util.Collections;
import java.util.Set;
import javax.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.model.net.comicbooks.SingleComicBookSelectionRequest;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ComicBookSelectionController</code> provides REST APIs for working with selections made by
 * users.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicBookSelectionController {
  public static final String LIBRARY_SELECTIONS = "library.selection";

  @Autowired private ComicBookSelectionService comicBookSelectionService;

  /**
   * Loads the comic book selection current held in the session.
   *
   * @param httpSession the session
   * @return the comic book ids
   */
  @GetMapping(value = "/api/comics/selections", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.load")
  public Set<Long> loadComicBookSelections(final HttpSession httpSession) {
    log.info("Loading comic book selections");
    Set<Long> result = (Set<Long>) httpSession.getAttribute(LIBRARY_SELECTIONS);
    if (result == null) {
      log.info("No selections found");
      result = Collections.emptySet();
    }
    return result;
  }

  /**
   * Called when the selection state for a single comic book is changed.
   *
   * @param httpSession the session
   * @param request the request body
   */
  @PostMapping(
      value = "/api/comics/selections/single",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-single")
  public void selectSingleComicBook(
      final HttpSession httpSession, @RequestBody() final SingleComicBookSelectionRequest request) {
    final Long id = request.getComicBookId();
    final boolean adding = request.getSelected();
    log.info("Updating comic selection: {}={}", id, adding ? "added" : "removed");
    final Set<Long> existingIds = (Set<Long>) httpSession.getAttribute(LIBRARY_SELECTIONS);
    httpSession.setAttribute(
        LIBRARY_SELECTIONS,
        this.comicBookSelectionService.selectSingleComicBook(existingIds, id, adding));
  }

  /**
   * Called when the selection state for multiple comics is changed.
   *
   * @param httpSession the session
   * @param request the request body
   */
  @PostMapping(
      value = "/api/comics/selections/multiple",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-multiple")
  public void selectMultipleComicBooks(
      final HttpSession httpSession,
      @RequestBody() final MultipleComicBooksSelectionRequest request) {
    final boolean adding = request.getSelected();
    log.info("Updating multiple comic books selection: {}", request);
    final Set<Long> existingIds = (Set<Long>) httpSession.getAttribute(LIBRARY_SELECTIONS);
    httpSession.setAttribute(
        LIBRARY_SELECTIONS,
        this.comicBookSelectionService.selectMultipleComicBooks(
            existingIds,
            request.getCoverYear(),
            request.getCoverMonth(),
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getReadState(),
            request.getUnscrapedState(),
            request.getSearchText(),
            adding));
  }

  /**
   * Clears the selections for the current user.
   *
   * @param httpSession the session
   */
  @DeleteMapping(value = "/api/library/selections")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.clear")
  public void clearSelections(final HttpSession httpSession) {
    log.info("Clearing comic selections");
    httpSession.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.clearSelectedComicBooks());
  }
}
