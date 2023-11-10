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
import jakarta.servlet.http.HttpSession;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.comicbooks.AddComicBookSelectionsByIdRequest;
import org.comixedproject.model.net.comicbooks.MultipleComicBooksSelectionRequest;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
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
  public static final String LIBRARY_SELECTIONS = "library.selections";

  @Autowired private ComicBookSelectionService comicBookSelectionService;
  @Autowired private OPDSUtils opdsUtils;

  /**
   * Loads the user's comic book selections.
   *
   * @param session the session
   * @return the comic book ids
   * @throws ComicBookSelectionException if an error occurs
   */
  @GetMapping(value = "/api/comics/selections", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.load")
  public List getAllSelections(final HttpSession session) throws ComicBookSelectionException {
    log.info("Loading comic book selections");
    return this.comicBookSelectionService.decodeSelections(
        session.getAttribute(LIBRARY_SELECTIONS));
  }

  /**
   * Adds a single comic book selection to a user.
   *
   * @param session the session
   * @param comicBookId the comic book id
   * @throws ComicBookSelectionException if an error occurs
   */
  @PutMapping(
      value = "/api/comics/selections/{comicBookId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-single")
  public void addSingleSelection(
      final HttpSession session, @PathVariable("comicBookId") final Long comicBookId)
      throws ComicBookSelectionException {
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
   * @throws ComicBookSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/{comicBookId}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.delete-single")
  public void deleteSingleSelection(
      final HttpSession session, @PathVariable("comicBookId") final Long comicBookId)
      throws ComicBookSelectionException {
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
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(
      value = "/api/comics/selections/multiple",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-by-filter")
  public void selectComicBooksByFilter(
      final HttpSession session, @RequestBody() final MultipleComicBooksSelectionRequest request)
      throws ComicBookSelectionException {
    log.info("Updating multiple comic books selection: {}", request);
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicBookSelectionService.selectByFilter(
        selections,
        request.getCoverYear(),
        request.getCoverMonth(),
        request.getArchiveType(),
        request.getComicType(),
        request.getComicState(),
        request.getUnscrapedState(),
        request.getSearchText(),
        request.getSelected());
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Adds selections by tag type and value
   *
   * @param session the session
   * @param tagTypeString the tag type string
   * @param tagValue the tag value
   * @throws ComicBookSelectionException if an error occurs
   */
  @PutMapping(value = "/api/comics/selections/tag/{tagType}/{tagValue}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-by-tag-type-and-value")
  public void addComicBooksByTagTypeAndValue(
      final HttpSession session,
      @PathVariable("tagType") final String tagTypeString,
      @PathVariable("tagValue") final String tagValue)
      throws ComicBookSelectionException {
    final ComicTagType tagType = ComicTagType.forValue(tagTypeString);
    final String decodedTagValue = this.opdsUtils.urlDecodeString(tagValue);
    log.info(
        "Adding multiple comic books by tag type and value: type={} value={}",
        tagType,
        decodedTagValue);
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicBookSelectionService.addByTagTypeAndValue(selections, tagType, tagValue);
    this.comicBookSelectionService.publisherSelections(selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Removes selections using filters.
   *
   * @param session the session
   * @param tagTypeString the tag type string
   * @param tagValue the tag value
   * @throws ComicBookSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/tag/{tagType}/{tagValue}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.remove-by-tag-type-and-value")
  public void removeComicBooksByTagTypeAndValue(
      final HttpSession session,
      @PathVariable("tagType") final String tagTypeString,
      @PathVariable("tagValue") final String tagValue)
      throws ComicBookSelectionException {
    final ComicTagType tagType = ComicTagType.forValue(tagTypeString);
    final String decodedTagValue = this.opdsUtils.urlDecodeString(tagValue);

    log.info(
        "Removing multiple comic books by tag type and value: type={} value={}",
        tagType,
        decodedTagValue);
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicBookSelectionService.removeByTagTypeAndValue(selections, tagType, tagValue);
    this.comicBookSelectionService.publisherSelections(selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Removes selections using filters.
   *
   * @param session the session
   * @param request the request body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(value = "/api/comics/selections/ids")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-or-remove-by-id")
  public void addComicBookSelectionsById(
      final HttpSession session, @RequestBody() final AddComicBookSelectionsByIdRequest request)
      throws ComicBookSelectionException {
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

    if (request.isSelected()) {
      log.info("Adding ids from comic book selections");
      selections.addAll(request.getComicBookIds());
    } else {
      log.info("Removing ids from comic book selections");
      selections.removeAll(request.getComicBookIds());
    }

    this.comicBookSelectionService.publisherSelections(selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }

  /**
   * Clears the selections for the current user.
   *
   * @param session the session
   * @throws ComicBookSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/clear")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.clear")
  public void clearSelections(final HttpSession session) throws ComicBookSelectionException {
    final List selections =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Clearing comic selections");
    this.comicBookSelectionService.clearSelectedComicBooks(selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(selections));
  }
}
