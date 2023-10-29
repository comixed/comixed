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

package org.comixedproject.rest.library;

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import java.util.List;
import javax.servlet.http.HttpSession;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.library.GetLastReadDatesResponse;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>LastReadController</code> provides REST APIs for working with the last read dates for
 * comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LastReadController {
  static final int MAXIMUM = 100;

  @Autowired private LastReadService lastReadService;
  @Autowired private ComicBookSelectionService comicBookSelectionService;

  /**
   * Retrieves a batch of last read entries for a given user.
   *
   * @param principal the user principal
   * @param lastId the last record id returned
   * @return the response body
   * @throws LastReadException if an error occurs
   */
  @GetMapping(value = "/api/library/read", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.last-read.get-all")
  @JsonView(View.LastReadList.class)
  public GetLastReadDatesResponse getLastReadEntries(
      final Principal principal, @RequestParam("lastId") final long lastId)
      throws LastReadException {
    final String email = principal.getName();
    log.info("Loading last read entries for user: email={} threshold={}", email, lastId);
    List<LastRead> entries = this.lastReadService.getLastReadEntries(email, lastId, MAXIMUM + 1);
    final boolean lastPayload = entries.size() <= MAXIMUM;
    if (!lastPayload) {
      log.trace("Reduce entry list to {} records", MAXIMUM);
      entries = entries.subList(0, MAXIMUM);
    }
    return new GetLastReadDatesResponse(entries, lastPayload);
  }

  /**
   * Marks a single comic book as read.
   *
   * @param principal the principal
   * @param comicBookId the comic book id
   */
  @PutMapping(value = "/api/library/read/{comicBookId}")
  @Timed(value = "comixed.last-read.mark-single-read")
  @PreAuthorize("hasRole('READER')")
  public void markSingleComicBookRead(
      final Principal principal, @PathVariable("comicBookId") final long comicBookId)
      throws LastReadException {
    final String email = principal.getName();
    log.info("Marking comic book as read for user: email={} id={}", email, comicBookId);
    this.lastReadService.markComicBookAsRead(email, comicBookId);
  }

  /**
   * Marks a single comic book as read.
   *
   * @param principal the principal
   * @param comicBookId the comic book id
   */
  @DeleteMapping(value = "/api/library/read/{comicBookId}")
  @Timed(value = "comixed.last-read.mark-single-read")
  @PreAuthorize("hasRole('READER')")
  public void markSingleComicBookUnread(
      final Principal principal, @PathVariable("comicBookId") final long comicBookId)
      throws LastReadException {
    final String email = principal.getName();
    log.info("Marking comic book as read for user: email={} id={}", email, comicBookId);
    this.lastReadService.markComicBookAsUnread(email, comicBookId);
  }

  /**
   * Marks all selected comics as read for the given user.
   *
   * @param session the session
   * @param principal the user principal
   * @throws LastReadException if an error occurs
   */
  @PutMapping(value = "/api/library/read/selected")
  @Timed(value = "comixed.last-read.mark-selections-read")
  @PreAuthorize("hasRole('READER')")
  public void markSelectedComicBooksRead(final HttpSession session, final Principal principal)
      throws LastReadException {
    this.doSetSelectedComicBooksReadState(session, principal, true);
  }

  /**
   * Marks all selected comics as unread for the given user.
   *
   * @param session the session
   * @param principal the user principal
   * @throws LastReadException if an error occurs
   */
  @DeleteMapping(value = "/api/library/read/selected")
  @Timed(value = "comixed.last-read.mark-selections-unread")
  @PreAuthorize("hasRole('READER')")
  public void markSelectedComicBooksUnread(final HttpSession session, final Principal principal)
      throws LastReadException {
    this.doSetSelectedComicBooksReadState(session, principal, false);
  }

  private void doSetSelectedComicBooksReadState(
      final HttpSession session, final Principal principal, final boolean markAsRead)
      throws LastReadException {
    final List<Long> ids;
    try {
      ids =
          this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      final String email = principal.getName();
      if (markAsRead) {
        log.info(
            "Marking {} comic{} as read for {}", ids.size(), ids.size() == 1 ? "" : "s", email);
        this.lastReadService.markComicBooksAsRead(email, ids);
      } else {
        log.info(
            "Marking {} comic{} as unread for {}", ids.size(), ids.size() == 1 ? "" : "s", email);
        this.lastReadService.markComicBooksAsUnread(email, ids);
      }
      this.comicBookSelectionService.clearSelectedComicBooks(ids);
      session.setAttribute(
          LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(ids));
    } catch (ComicBookSelectionException error) {
      throw new LastReadException("Failed to update last read state for selected comics", error);
    }
  }
}
