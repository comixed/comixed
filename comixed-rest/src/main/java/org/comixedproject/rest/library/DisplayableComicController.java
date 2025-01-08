/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.net.library.*;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookSelectionService;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>DisplayableComicController</code> provides REST endpoints for loading instances of {@link
 * DisplayableComic}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class DisplayableComicController {
  @Autowired private DisplayableComicService displayableComicService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicBookSelectionService comicBookSelectionService;
  @Autowired private UserService userService;
  @Autowired private ReadingListService readingListService;

  /**
   * Loads one page's worth of displayable comics.
   *
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/api/comics/filtered",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-filtered")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadComicsByFilter(@RequestBody() final LoadComicsRequest request) {
    log.info("Loading comics: {}", request);
    final List<DisplayableComic> comics =
        this.displayableComicService.loadComicsByFilter(
            request.getPageSize(),
            request.getPageIndex(),
            request.getCoverYear(),
            request.getCoverMonth(),
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume(),
            request.getSortBy(),
            request.getSortDirection());
    final List<Integer> coverYears =
        this.displayableComicService.getCoverYearsForFilter(
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume());
    final List<Integer> coverMonths =
        this.displayableComicService.getCoverMonthsForFilter(
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume());
    final long filterCount =
        this.displayableComicService.getComicCountForFilter(
            request.getCoverYear(),
            request.getCoverMonth(),
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume());
    final long totalCount = this.comicBookService.getComicBookCount();
    return new LoadComicsResponse(comics, coverYears, coverMonths, totalCount, filterCount);
  }

  /**
   * Loads one page's worth of displayable comics that have been selected.
   *
   * @param session the http session
   * @param request the request body
   * @return the response body
   * @throws ComicBookSelectionException if an error occurs
   */
  @PostMapping(
      value = "/api/comics/selected",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadComicsBySelectedState(
      final HttpSession session, @RequestBody() final LoadSelectedComicsRequest request)
      throws ComicBookSelectionException {
    log.info("Loading selected comics: {}", request);
    final List<Long> selectedIds =
        this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
    final List<DisplayableComic> comics =
        this.displayableComicService.loadComicsById(
            request.getPageSize(),
            request.getPageIndex(),
            request.getSortBy(),
            request.getSortDirection(),
            selectedIds);
    final List<Integer> coverYears = Collections.emptyList();
    final List<Integer> coverMonths = Collections.emptyList();
    return new LoadComicsResponse(
        comics, coverYears, coverMonths, selectedIds.size(), selectedIds.size());
  }

  /**
   * Loads comics for a tag type and value.
   *
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/api/comics/collection",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-for-collection")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadComicsByTagTypeAndValue(
      @RequestBody() final LoadComicsForCollectionRequest request) {
    log.info("Loading comics for collection: {}", request);
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final ComicTagType tagType = request.getTagType();
    final String tagValue = request.getTagValue();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    final List<DisplayableComic> comicDetails =
        this.displayableComicService.loadComicsByTagTypeAndValue(
            pageSize, pageIndex, tagType, tagValue, sortBy, sortDirection);
    final long filteredComics =
        this.displayableComicService.getComicCountForFilter(tagType, tagValue);
    return new LoadComicsResponse(
        comicDetails,
        this.displayableComicService.getCoverYearsForTagTypeAndValue(tagType, tagValue),
        this.displayableComicService.getCoverMonthsForFilter(tagType, tagValue),
        filteredComics,
        filteredComics);
  }

  /**
   * Loads unread comics for the requesting user.
   *
   * @param principal the user principal
   * @param request the request body
   * @return the comic list
   */
  @PostMapping(
      value = "/api/comics/unread",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-unread")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadUnreadComics(
      final Principal principal, @RequestBody() final LoadComicsByReadStateRequest request)
      throws ComiXedUserException {
    final String email = principal.getName();
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Load unread comics: {}", request);
    final ComiXedUser user = this.userService.findByEmail(email);
    final List<DisplayableComic> comics =
        this.displayableComicService.loadUnreadComics(
            user, pageSize, pageIndex, sortBy, sortDirection);
    final long comicBookCount = this.comicBookService.getComicBookCount();
    final long filteredCount = comicBookCount - user.getReadComicBooks().size();
    return new LoadComicsResponse(
        comics, Collections.emptyList(), Collections.emptyList(), filteredCount, filteredCount);
  }

  /**
   * Loads read comics for the requesting user.
   *
   * @param principal the user principal
   * @param request the request body
   * @return the comic list
   */
  @PostMapping(
      value = "/api/comics/read",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-unread")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadReadComics(
      final Principal principal, @RequestBody() final LoadComicsByReadStateRequest request)
      throws ComiXedUserException {
    final String email = principal.getName();
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Loading read comics: {}", request);
    final ComiXedUser user = this.userService.findByEmail(email);
    final List<DisplayableComic> comics =
        this.displayableComicService.loadReadComics(
            user, pageSize, pageIndex, sortBy, sortDirection);
    final long filteredCount = user.getReadComicBooks().size();
    return new LoadComicsResponse(
        comics, Collections.emptyList(), Collections.emptyList(), filteredCount, filteredCount);
  }

  /**
   * Loads comics for a reading list.
   *
   * @param principal the user principal
   * @param request the request body
   * @param readingListId the reading list id
   * @return the entries
   * @throws LibraryException if an error occurs
   * @throws ReadingListException if an error occurs
   */
  @PostMapping(
      value = "/api/comics/lists/{readingListId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-for-reading-list")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadComicsForList(
      final Principal principal,
      @RequestBody() final LoadComicForListRequest request,
      @PathVariable("readingListId") final long readingListId)
      throws ReadingListException, LibraryException {
    final String email = principal.getName();
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Loading comics for a list: id={} {}", readingListId, request);

    final List<DisplayableComic> comics =
        this.displayableComicService.loadComicsForList(
            email, readingListId, pageSize, pageIndex, sortBy, sortDirection);

    final long filterCount = this.readingListService.getEntryCount(readingListId);
    return new LoadComicsResponse(
        comics, Collections.emptyList(), Collections.emptyList(), filterCount, filterCount);
  }

  /**
   * Loads duplicate comic books.
   *
   * @param request the request body
   * @return the entries
   */
  @PostMapping(
      value = "/api/comics/duplicates",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-duplicate-comics")
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadDuplicateComics(
      @RequestBody() final LoadDuplicateComicsRequest request) {
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Loading duplicate comic book details: {}", request);
    final List<DisplayableComic> comics =
        this.displayableComicService.loadDuplicateComics(
            pageSize, pageIndex, sortBy, sortDirection);

    final long filterCount = this.displayableComicService.getDuplicateComicCount();
    return new LoadComicsResponse(
        comics, Collections.emptyList(), Collections.emptyList(), filterCount, filterCount);
  }
}
