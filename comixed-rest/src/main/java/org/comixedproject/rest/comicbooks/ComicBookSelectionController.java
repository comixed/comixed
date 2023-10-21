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
import java.security.Principal;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.service.comicbooks.ComicSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
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

  @Autowired private ComicSelectionService comicSelectionService;

  /**
   * Loads the user's comic book selections.
   *
   * @param principal the session
   * @return the comic book ids
   */
  @GetMapping(value = "/api/comics/selections", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.load")
  public Set<Long> getAllForEmail(final Principal principal) throws ComicSelectionException {
    final String email = principal.getName();
    log.info("Loading comic book selections: email={}", email);
    return this.comicSelectionService.getAllForEmail(email);
  }

  /**
   * Adds a single comic book selection to a user.
   *
   * @param principal the user principal
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
      final Principal principal, @PathVariable("comicBookId") final Long comicBookId)
      throws ComicSelectionException {
    final String email = principal.getName();
    log.info("Adding comic selection: email={} comic book id={}", email, comicBookId);
    this.comicSelectionService.addComicSelectionForUser(email, comicBookId);
  }

  /**
   * Removes a single comic book selection from a user.
   *
   * @param principal the user principal
   * @param comicBookId the comic book id
   * @throws ComicSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/{comicBookId}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.delete-single")
  public void deleteSingleSelection(
      final Principal principal, @PathVariable("comicBookId") final Long comicBookId)
      throws ComicSelectionException {
    final String email = principal.getName();
    log.info("Removing comic selection: email={} comic book id={}", email, comicBookId);
    this.comicSelectionService.removeComicSelectionFromUser(email, comicBookId);
  }

  /**
   * Adds selections using filters.
   *
   * @param principal the user principal
   * @param request the request body
   */
  @PostMapping(
      value = "/api/comics/selections/multiple",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-multiple")
  public void selectMultipleComicBooks(
      final Principal principal, @RequestBody() final MultipleComicBooksSelectionRequest request)
      throws ComicSelectionException {
    final String email = principal.getName();
    final boolean adding = request.getSelected();
    log.info("Updating multiple comic books selection: {}", request);
    this.comicSelectionService.selectMultipleComicBooks(
        email,
        request.getCoverYear(),
        request.getCoverMonth(),
        request.getArchiveType(),
        request.getComicType(),
        request.getComicState(),
        request.getReadState(),
        request.getUnscrapedState(),
        request.getSearchText(),
        adding);
  }

  /**
   * Clears the selections for the current user.
   *
   * @param principal the user principal
   */
  @DeleteMapping(value = "/api/library/selections")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.clear")
  public void clearSelections(final Principal principal) throws ComicSelectionException {
    final String email = principal.getName();
    log.info("Clearing comic selections for user: {}", email);
    this.comicSelectionService.clearSelectedComicBooks(email);
  }
}
