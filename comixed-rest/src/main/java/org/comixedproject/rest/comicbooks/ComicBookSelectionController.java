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
import java.security.Principal;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
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
  /** The comic book selections session property name. */
  public static final String LIBRARY_SELECTIONS = "library.selections";

  @Autowired private ComicSelectionService comicSelectionService;
  @Autowired private UserService userService;
  @Autowired private OPDSUtils opdsUtils;
  @Autowired private DisplayableComicService displayableComicService;

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
  public List<Long> getAllSelections(final HttpSession session) throws ComicBookSelectionException {
    log.info("Loading comic book selections");
    return this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
  }

  /**
   * Adds a single comic book selection to a user.
   *
   * @param session the session
   * @param principal the user principal
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
      final HttpSession session,
      final Principal principal,
      @PathVariable("comicBookId") final Long comicBookId)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Adding comic selection: email={} comic book id={}", email, comicBookId);
    this.comicSelectionService.addComicSelectionForUser(email, selections, comicBookId);
    log.debug("Updating comic selections");
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Removes a single comic book selection from a user.
   *
   * @param session the session
   * @param principal the user principal
   * @param comicBookId the comic book id
   * @throws ComicBookSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/{comicBookId}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.delete-single")
  public void deleteSingleSelection(
      final HttpSession session,
      final Principal principal,
      @PathVariable("comicBookId") final Long comicBookId)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    log.info("Removing comic selection: email={} comic book id={}", email, comicBookId);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicSelectionService.removeComicSelectionFromUser(email, selections, comicBookId);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Adds selections using filters.
   *
   * @param session the session
   * @param principal the user principal
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
      final HttpSession session,
      final Principal principal,
      @RequestBody() final MultipleComicBooksSelectionRequest request)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    log.info("Updating multiple comic books selection: email={} {}", email, request);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicSelectionService.selectByFilter(
        email,
        selections,
        request.getCoverYear(),
        request.getCoverMonth(),
        request.getArchiveType(),
        request.getComicType(),
        request.getComicState(),
        request.getUnscrapedState(),
        request.getPageCount(),
        request.getSearchText(),
        request.getSelected());
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Adds selections by tag type and value
   *
   * @param session the session
   * @param principal the user principal
   * @param tagType the tag type
   * @param tagValue the tag value
   * @throws ComicBookSelectionException if an error occurs
   */
  @PutMapping(value = "/api/comics/selections/tag/{tagType}/{tagValue}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-by-tag-type-and-value")
  public void addComicBooksByTagTypeAndValue(
      final HttpSession session,
      final Principal principal,
      @PathVariable("tagType") final ComicTagType tagType,
      @PathVariable("tagValue") final String tagValue)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final String decodedTagValue = this.opdsUtils.urlDecodeString(tagValue);
    log.info(
        "Adding multiple comic books by tag type and value: email={} type={} value={}",
        email,
        tagType,
        decodedTagValue);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicSelectionService.addByTagTypeAndValue(selections, tagType, tagValue);
    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Removes selections using filters.
   *
   * @param session the session
   * @param principal the user principal
   * @param tagType the tag type
   * @param tagValue the tag value
   * @throws ComicBookSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/tag/{tagType}/{tagValue}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.remove-by-tag-type-and-value")
  public void removeComicBooksByTagTypeAndValue(
      final HttpSession session,
      final Principal principal,
      @PathVariable("tagType") final ComicTagType tagType,
      @PathVariable("tagValue") final String tagValue)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final String decodedTagValue = this.opdsUtils.urlDecodeString(tagValue);

    log.info(
        "Removing multiple comic books by tag type and value: email={} type={} value={}",
        email,
        tagType,
        decodedTagValue);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    this.comicSelectionService.removeByTagTypeAndValue(selections, tagType, tagValue);
    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Updates selections using filters.
   *
   * @param session the session
   * @param principal the user principal
   * @param request the request body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(value = "/api/comics/selections/ids")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-or-remove-by-id")
  public void addComicBookSelectionsById(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final AddComicBookSelectionsByIdRequest request)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

    if (request.isSelected()) {
      log.info("Adding ids from comic book selections for {}", email);
      selections.addAll(request.getComicBookIds());
    } else {
      log.info("Removing ids from comic book selections for {}", email);
      selections.removeAll(request.getComicBookIds());
    }

    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Updates selections by publisher.
   *
   * @param session the session
   * @param principal the user principal
   * @param request the request body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(value = "/api/comics/selections/publisher")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-or-remove-by-id")
  public void addComicBookSelectionsByPublisher(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final AddComicBookSelectionsByPublisherRequest request)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final String publisher = request.getPublisher();
    final boolean selected = request.isSelected();
    log.info(
        "Setting selections by publisher name: email={} publisher={} selected={}",
        email,
        publisher,
        selected);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

    if (selected) {
      log.info("Adding ids from comic book selections");
      selections.addAll(this.displayableComicService.getIdsByPublisher(publisher));
    } else {
      log.info("Removing ids from comic book selections");
      selections.removeAll(this.displayableComicService.getIdsByPublisher(publisher));
    }

    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Updates selections by publisher, series, and volume.
   *
   * @param session the session
   * @param principal the user principal
   * @param request the request body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(value = "/api/comics/selections/series")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-or-remove-by-id")
  public void addComicBookSelectionsByPublisherSeriesVolume(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final AddComicBookSelectionsByPublisherSeriesVolumeRequest request)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final String publisher = request.getPublisher();
    final String series = request.getSeries();
    final String volume = request.getVolume();
    final boolean selected = request.isSelected();
    log.info(
        "Setting selections by publisher name: email={} publisher={} series={} volume={} selected={}",
        email,
        publisher,
        series,
        volume,
        selected);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

    if (selected) {
      log.info("Adding ids from comic book selections");
      selections.addAll(
          this.displayableComicService.getIdsByPublisherSeriesAndVolume(publisher, series, volume));
    } else {
      log.info("Removing ids from comic book selections");
      selections.removeAll(
          this.displayableComicService.getIdsByPublisherSeriesAndVolume(publisher, series, volume));
    }

    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Updates selections for all duplicate comic books.
   *
   * @param session the session
   * @param principal the user principal
   * @param request the request body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(value = "/api/comics/selections/duplicates")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-or-remove-by-id")
  public void addDuplicateComicBooksSelection(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final DuplicateComicBooksSelectionRequest request)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final boolean selected = request.isSelected();
    log.info(
        "Setting selections for all duplicate comic books: email={} selected={}", email, selected);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

    final List<Long> idList = this.displayableComicService.getDuplicateComicIds();
    if (selected) {
      log.info("Selecting ids for duplicate comic books");
      selections.addAll(idList);
    } else {
      log.info("Deselecting ids for duplicate comic books");
      selections.removeAll(idList);
    }

    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Sets the selected state on comic books based on their read state.
   *
   * @param session the user session
   * @param principal the user principal
   * @param request the request body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(value = "/api/comics/selections/unread", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.add-by-unread-state")
  public void addUnreadComicBooksSelection(
      final HttpSession session,
      final Principal principal,
      @RequestBody() final UnreadComicBooksSelectionRequest request)
      throws ComicBookSelectionException, ComiXedUserException {
    final String email = principal.getName();
    final boolean selected = request.isSelected();
    final boolean unread = request.isUnreadOnly();
    log.info(
        "Setting the selection state for comics based on their read state: email={} selected={} unread={}",
        email,
        selected,
        unread);
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

    if (selected) {
      selections.addAll(this.userService.getComicBookIdsForUser(email, unread));
    } else {
      selections.removeAll(this.userService.getComicBookIdsForUser(email, unread));
    }
    this.comicSelectionService.publishSelections(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }

  /**
   * Clears the selections for the current user.
   *
   * @param session the session
   * @param principal the user principal
   * @throws ComicBookSelectionException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/selections/clear")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.comic-book.selections.clear")
  public void clearSelections(final HttpSession session, final Principal principal)
      throws ComicBookSelectionException {
    final String email = principal.getName();
    final List<Long> selections =
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    log.info("Clearing comic selections for {}", email);
    this.comicSelectionService.clearSelectedComicBooks(email, selections);
    session.setAttribute(
        LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(selections));
  }
}
