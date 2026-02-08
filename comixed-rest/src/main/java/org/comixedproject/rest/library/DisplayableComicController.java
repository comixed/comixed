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
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.net.library.*;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.service.comicbooks.ComicBookSelectionException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicbooks.ComicSelectionService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.service.library.LibraryException;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateChangeListener;
import org.comixedproject.state.comicbooks.ComicStateHandler;
import org.comixedproject.views.View;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.Message;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.statemachine.state.State;
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
public class DisplayableComicController implements InitializingBean, ComicStateChangeListener {
  @Autowired private DisplayableComicService displayableComicService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicSelectionService comicSelectionService;
  @Autowired private UserService userService;
  @Autowired private ReadingListService readingListService;
  @Autowired private ComicStateHandler comicStateHandler;

  Map<LoadComicsByFilterRequest, LoadComicsResponse> filterCache = new ConcurrentHashMap<>();
  Map<TagTypeAndValue, LoadComicsResponse> tagAndValueCache = new ConcurrentHashMap<>();

  @Override
  public void afterPropertiesSet() {
    log.trace("Registering for comic state change updates");
    this.comicStateHandler.addListener(this);
  }

  @Override
  public void onComicStateChange(
      final State<ComicState, ComicEvent> state, final Message<ComicEvent> message) {
    log.debug("Clearing comic caches");
    this.filterCache.clear();
    this.tagAndValueCache.clear();
  }

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
  public LoadComicsResponse loadComicsByFilter(
      @RequestBody() final LoadComicsByFilterRequest request) {
    log.info("Loading comics: {}", request);
    if (this.filterCache.containsKey(request)) {
      log.info("Cache hit for request");
      return this.filterCache.get(request);
    }
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
            request.getMissing(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume(),
            request.getPageCount(),
            request.getSortBy(),
            request.getSortDirection());
    final List<Integer> coverYears =
        this.displayableComicService.getCoverYearsForFilter(
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getMissing(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume(),
            request.getPageCount());
    final List<Integer> coverMonths =
        this.displayableComicService.getCoverMonthsForFilter(
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getMissing(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume(),
            request.getPageCount());
    final long filterCount =
        this.displayableComicService.getComicCountForFilter(
            request.getCoverYear(),
            request.getCoverMonth(),
            request.getArchiveType(),
            request.getComicType(),
            request.getComicState(),
            request.getUnscrapedState(),
            request.getMissing(),
            request.getSearchText(),
            request.getPublisher(),
            request.getSeries(),
            request.getVolume(),
            request.getPageCount());
    final long totalCount = this.comicBookService.getComicBookCount();
    final LoadComicsResponse response =
        new LoadComicsResponse(comics, coverYears, coverMonths, totalCount, filterCount);
    this.filterCache.put(request, response);
    return response;
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
        this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
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
   * @param tagType the tag type
   * @param tagValue the tag value
   * @return the response body
   */
  @PostMapping(
      value = "/api/comics/collections/{tagType}/{tagValue}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-for-collection")
  @PreAuthorize("hasRole('READER')")
  @JsonView(View.ComicDetailsView.class)
  public LoadComicsResponse loadComicsByTagTypeAndValue(
      @RequestBody() final LoadComicsForCollectionRequest request,
      @PathVariable("tagType") final ComicTagType tagType,
      @PathVariable("tagValue") final String tagValue) {
    log.info("Loading comics for collection: {}", request);
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    final TagTypeAndValue key =
        new TagTypeAndValue(tagType, tagValue, pageSize, pageIndex, sortBy, sortDirection);
    if (this.tagAndValueCache.containsKey(key)) {
      log.info("Cache hit for tag: {}={}", tagType, tagValue);
      return this.tagAndValueCache.get(key);
    }
    final List<DisplayableComic> comicDetails =
        this.displayableComicService.loadComicsByTagTypeAndValue(
            pageSize, pageIndex, tagType, tagValue, sortBy, sortDirection);
    final long filteredComics =
        this.displayableComicService.getComicCountForTagTypeAndValue(tagType, tagValue);
    final LoadComicsResponse result =
        new LoadComicsResponse(
            comicDetails,
            this.displayableComicService.getCoverYearsForTagTypeAndValue(tagType, tagValue),
            this.displayableComicService.getCoverMonthsForTagTypeAndValue(tagType, tagValue),
            filteredComics,
            filteredComics);
    this.tagAndValueCache.put(key, result);
    return result;
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

  @AllArgsConstructor
  static class TagTypeAndValue {
    @Getter private ComicTagType tagType;
    @Getter private String value;
    @Getter private int pageSize;
    @Getter private int pageIndex;
    @Getter private String sortBy;
    @Getter private String sortDirection;

    @Override
    public boolean equals(final Object o) {
      if (o == null || getClass() != o.getClass()) return false;
      final TagTypeAndValue that = (TagTypeAndValue) o;
      return getPageSize() == that.getPageSize()
          && getPageIndex() == that.getPageIndex()
          && getTagType() == that.getTagType()
          && Objects.equals(getValue(), that.getValue())
          && Objects.equals(getSortBy(), that.getSortBy())
          && Objects.equals(getSortDirection(), that.getSortDirection());
    }

    @Override
    public int hashCode() {
      return Objects.hash(
          getTagType(), getValue(), getPageSize(), getPageIndex(), getSortBy(), getSortDirection());
    }
  }
}
