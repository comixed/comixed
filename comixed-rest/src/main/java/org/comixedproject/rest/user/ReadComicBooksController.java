/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

package org.comixedproject.rest.user;

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.user.ReadComicBooksException;
import org.comixedproject.service.user.ReadComicBooksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ReadComicBooksController</code> processes requests dealing with marking comics as read or
 * unread.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ReadComicBooksController {
  @Autowired private ReadComicBooksService readComicBooksService;
  @Autowired private ComicSelectionService comicSelectionService;

  /**
   * Marks a single comic book as read by the given user.
   *
   * @param principal the user principal
   * @param comicId the comic book id
   * @throws ReadComicBooksException if an error occurs
   */
  @PutMapping(value = "/api/user/read/{comicId}", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed("comixed.read-comic-books.mark-single")
  public void markSingleComicBookRead(
      final Principal principal, @PathVariable("comicId") final long comicId)
      throws ReadComicBooksException {
    final String email = principal.getName();
    log.info("Marking a single comic book as read by {}: id={}", email, comicId);
    this.readComicBooksService.markComicBookAsRead(email, comicId);
  }

  /**
   * Unmarks a single comic book as read by the given user.
   *
   * @param principal the user principal
   * @param comicId the comic book id
   * @throws ReadComicBooksException if an error occurs
   */
  @DeleteMapping(value = "/api/user/read/{comicId}")
  @PreAuthorize("hasRole('READER')")
  @Timed("comixed.read-comic-books.unmark-single")
  public void unmarkSingleComicBookRead(
      final Principal principal, @PathVariable("comicId") final long comicId)
      throws ReadComicBooksException {
    final String email = principal.getName();
    log.info("Unmarking a single comic book as read by {}: id={}", email, comicId);
    this.readComicBooksService.unmarkComicBookAsRead(email, comicId);
  }

  /**
   * Marks all selected comic books as read.
   *
   * @param principal the user principal
   * @param httpSession the user's session
   * @throws ComicBookSelectionException if an error occurs
   * @throws ReadComicBooksException if an error occurs
   */
  @PutMapping(value = "/api/user/read/selected", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed("comixed.read-comic-books.mark-selected")
  public void markSelectedComicBooksRead(final Principal principal, final HttpSession httpSession)
      throws ComicBookSelectionException, ReadComicBooksException {
    final String email = principal.getName();
    log.info("Marking selected comic books as read by {}", email);
    final List<Long> selectedIds =
        this.comicSelectionService.decodeSelections(httpSession.getAttribute(LIBRARY_SELECTIONS));
    this.readComicBooksService.markSelectionsAsRead(email, new ArrayList<>(selectedIds));
    this.comicSelectionService.clearSelectedComicBooks(new ArrayList<>(selectedIds));
    httpSession.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedIds));
  }

  /**
   * Unmarks all selected comic books as read.
   *
   * @param principal the user principal
   * @param httpSession the user's session
   * @throws ComicBookSelectionException if an error occurs
   * @throws ReadComicBooksException if an error occurs
   */
  @DeleteMapping(value = "/api/user/read/selected")
  @PreAuthorize("hasRole('READER')")
  @Timed("comixed.read-comic-books.mark-selected")
  public void unmarkSelectedComicBooksRead(final Principal principal, final HttpSession httpSession)
      throws ComicBookSelectionException, ReadComicBooksException {
    final String email = principal.getName();
    log.info("Unmarking selected comic books as read by {}", email);
    final List<Long> selectedIds =
        this.comicSelectionService.decodeSelections(httpSession.getAttribute(LIBRARY_SELECTIONS));
    this.readComicBooksService.unmarkSelectionsAsRead(email, new ArrayList<>(selectedIds));
    this.comicSelectionService.clearSelectedComicBooks(selectedIds);
    httpSession.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selectedIds));
  }
}
