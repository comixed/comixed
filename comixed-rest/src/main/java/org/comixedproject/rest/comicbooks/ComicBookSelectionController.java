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
import java.util.List;
import javax.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicSelectionException;
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
  public static final String LIBRARY_SELECTIONS = "library.selections";

  @Autowired private ComicBookSelectionService comicBookSelectionService;

  /**
   * Loads the user's comic book selections.
   *
   * @param session the session
   * @return the comic book ids
   */
  @GetMapping(value = "/api/comics/selections", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.load")
  public List getAllSelections(final HttpSession session) throws ComicSelectionException {
    log.info("Loading comic book selections");
    return this.comicBookSelectionService.decodeSelections(
        session.getAttribute(LIBRARY_SELECTIONS));
  }

  /**
   * Adds a single comic book selection to a user.
   *
   * @param session the session
   * @param comicBookId the comic book id
   * @throws ComicSelectionException if an error occurs
   */
  @PutMapping(
      value = "/api/comics/selections/{comicBookId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-single")
  public void addSingleSelection(
      final HttpSession session, @PathVariable("comicBookId") final Long comicBookId)
      throws ComicSelectionException {
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Adding comic selection: comic book id={}", comicBookId);
    this.comicBookSelectionService.addComicSelectionForUser(selections, comicBookId);
    log.debug("Updating comic selections");
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Removes a single comic book selection from a user.
   *
   * @param session the session
   * @param comicBookId the comic book id
   * @throws ComicSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/{comicBookId}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.delete-single")
  public void deleteSingleSelection(
      final HttpSession session, @PathVariable("comicBookId") final Long comicBookId)
      throws ComicSelectionException {
    log.info("Removing comic selection:comic book id={}", comicBookId);
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicBookSelectionService.removeComicSelectionFromUser(selections, comicBookId);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Adds selections using filters.
   *
   * @param session the session
   * @param request the request body
   * @throws ComicSelectionException if an error occurs
   */
  @PostMapping(
      value = "/api/comics/selections/multiple",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-multiple")
  public void selectMultipleComicBooks(
      final HttpSession session, @RequestBody() final MultipleComicBooksSelectionRequest request)
      throws ComicSelectionException {
    log.info("Updating multiple comic books selection: {}", request);
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicBookSelectionService.selectMultipleComicBooks(
        selections,
        request.getCoverYear(),
        request.getCoverMonth(),
        request.getArchiveType(),
        request.getComicType(),
        request.getComicState(),
        request.getReadState(),
        request.getUnscrapedState(),
        request.getSearchText(),
        request.getSelected());
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Clears the selections for the current user.
   *
   * @param session the session
   * @throws ComicSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/library/selections")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.clear")
  public void clearSelections(final HttpSession session) throws ComicSelectionException {
    final List<Long> selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Clearing comic selections");
    this.comicBookSelectionService.clearSelectedComicBooks(selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }
}
