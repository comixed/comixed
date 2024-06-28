/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project.
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

import static org.comixedproject.rest.comicbooks.ComicBookSelectionController.LIBRARY_SELECTIONS;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicbooks.ComicTagType;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.service.comicbooks.*;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.comicpages.ComicPageException;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.service.lists.ReadingListException;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.views.View.ComicDetailsView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>ComicBookController</code> provides REST endpoints for instances of {@link ComicBook}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicBookController {
  public static final String MISSING_COMIC_COVER_FILENAME = "/images/missing-comic.png";

  /** The missing comic cover filename */
  public static final String MISSING_COMIC_COVER = "missing-comic-cover";

  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ComicBookSelectionService comicBookSelectionService;
  @Autowired private ComicPageService comicPageService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private ComicFileService comicFileService;
  @Autowired private ReadingListService readingListService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private LastReadService lastReadService;

  /**
   * Retrieves a single comic for a user. The comic is populated with user-specific meta-data.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicBookException if an error occurs
   */
  @GetMapping(value = "/api/comics/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.get-one")
  @JsonView(ComicDetailsView.class)
  public ComicBook getComic(@PathVariable("id") long id) throws ComicBookException {
    log.debug("Getting comic: id={}", id);
    return this.comicBookService.getComic(id);
  }

  /**
   * Marks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicBookException if the id is invalid
   */
  @DeleteMapping(value = "/api/comics/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.mark-one.deleted")
  @JsonView({ComicDetailsView.class})
  public ComicBook deleteComicBook(@PathVariable("id") long id) throws ComicBookException {
    log.debug("Marking comic book as deleted: id={}", id);
    return this.comicBookService.deleteComicBook(id);
  }

  /**
   * Marks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicBookException if the id is invalid
   */
  @PutMapping(value = "/api/comics/{id}/undelete", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.mark-one.undeleted")
  @JsonView({ComicDetailsView.class})
  public ComicBook undeleteComicBook(@PathVariable("id") long id) throws ComicBookException {
    log.info("Marking comic book as undeleted: id={}", id);
    return this.comicBookService.undeleteComicBook(id);
  }

  /**
   * Removes all metadata from a comic.
   *
   * @param id the comic id
   * @return the upddtaed comic
   * @throws ComicBookException if the id is invalid
   */
  @DeleteMapping(value = "/api/comics/{id}/metadata", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.metadata.delete")
  @JsonView(ComicDetailsView.class)
  public ComicBook deleteMetadata(@PathVariable("id") long id) throws ComicBookException {
    log.debug("Deleting comic metadata: id={}", id);
    return this.comicBookService.deleteMetadata(id);
  }

  /**
   * Deletes the selected comic books.
   *
   * @param session the session
   * @throws ComicBookException if an error occurs
   */
  @DeleteMapping(value = "/api/comics/mark/deleted/selected")
  @Timed(value = "comixed.comics.mark-many.delete-selected")
  public void deleteSelectedComicBooks(final HttpSession session) throws ComicBookException {

    try {
      final List<Long> ids =
          this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      log.debug("Deleting multiple comics: ids={}", ids.toArray());
      this.comicBookService.deleteComicBooksById(ids);

      this.comicBookSelectionService.clearSelectedComicBooks(ids);
      session.setAttribute(
          LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(ids));
    } catch (ComicBookSelectionException error) {
      throw new ComicBookException("Failed to delete selected comic books", error);
    }
  }

  /**
   * Undeletes the selected comic books
   *
   * @param session the http session
   * @throws ComicBookException if an error occurs
   */
  @PutMapping(
      value = "/api/comics/mark/deleted/selected",
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comics.mark-many.undelete-selected")
  public void undeleteSelectedComicBooks(final HttpSession session) throws ComicBookException {
    try {
      final List<Long> ids =
          this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

      log.debug("Undeleting multiple comic: {}", ids.toArray());
      this.comicBookService.undeleteComicBooksById(ids);

      this.comicBookSelectionService.clearSelectedComicBooks(ids);
      session.setAttribute(
          LIBRARY_SELECTIONS, this.comicBookSelectionService.encodeSelections(ids));
    } catch (ComicBookSelectionException error) {
      throw new ComicBookException("Failed to delete selected comic books", error);
    }
  }

  /**
   * Downloads a single comic book, identified by record id.
   *
   * @param id the record id
   * @return the comic book
   * @throws ComicBookException if an error occurs
   */
  @GetMapping(value = "/api/comics/{id}/download")
  @Timed(value = "comixed.comic-book.download")
  public DownloadDocument downloadComic(@PathVariable("id") long id) throws ComicBookException {
    log.debug("Download comic book: id={}", id);
    return this.comicBookService.getComicContent(id);
  }

  /**
   * Updates a comicBook with all incoming data.
   *
   * @param id the comicBook id
   * @param comicBook the source comicBook
   * @return the updated comicBook
   * @throws ComicBookException if the id is invalid
   */
  @PutMapping(
      value = "/api/comics/{id}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.metadata.update")
  @JsonView(ComicDetailsView.class)
  public ComicBook updateComic(@PathVariable("id") long id, @RequestBody() ComicBook comicBook)
      throws ComicBookException {
    log.debug("Updating comicBook: id={}", id, comicBook);

    return this.comicBookService.updateComic(id, comicBook);
  }

  /**
   * Retrieves the cover page content for a comic.
   *
   * @param id the comic id
   * @return the page content
   * @throws ComicBookException if an error occurs
   */
  @GetMapping(value = "/api/comics/{id}/cover/content")
  @Timed(value = "comixed.comic-book.pages.get-cover")
  public ResponseEntity<byte[]> getCoverImage(@PathVariable("id") final long id)
      throws ComicBookException {
    log.debug("Getting cover for comicBook: id={}", id);
    final ComicBook comicBook = this.comicBookService.getComic(id);
    try {
      return this.pageCacheService.getPageContent(
          comicBook.getPages().get(0).getId(), MISSING_COMIC_COVER);
    } catch (ComicPageException error) {
      throw new ComicBookException("Failed to load comic cover", error);
    }
  }

  /**
   * Updates the order of pages in a comic.
   *
   * @param id the comic id
   * @param request the request body
   * @throws ComicBookException if an error occurs
   */
  @PostMapping(value = "/api/comics/{id}/pages/order", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.pages.update-order")
  @PreAuthorize("hasRole('ADMIN')")
  public void savePageOrder(
      @PathVariable("id") final long id, @RequestBody() final SavePageOrderRequest request)
      throws ComicBookException {
    log.debug("Updating page order: comic id={}", id);
    this.comicBookService.savePageOrder(id, request.getEntries());
  }

  /**
   * Loads one display page's worth of comic details.
   *
   * @param session the http session
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/api/comics/details/load",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load")
  @PreAuthorize("hasRole('READER')")
  @JsonView(ComicDetailsView.class)
  public LoadComicDetailsResponse loadComicDetailList(
      final HttpSession session, @RequestBody() final LoadComicDetailsRequest request)
      throws LastReadException, ComicBookSelectionException {
    log.debug("Loading comics: {}", request);
    List<ComicDetail> comicDetails;
    List<Integer> coverYears;
    List<Integer> coverMonths;
    long totalCount = 0L;
    long filterCount = 0L;
    if (request.getSelected()) {
      final List selectedIds =
          this.comicBookSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      comicDetails =
          this.comicDetailService.loadComicDetailList(
              request.getPageSize(),
              request.getPageIndex(),
              request.getSortBy(),
              request.getSortDirection(),
              selectedIds);
      coverYears = Collections.emptyList();
      coverMonths = Collections.emptyList();
      filterCount = comicDetails.size();
      totalCount = selectedIds.size();
    } else {
      log.debug("Loading comics: {}", request);
      comicDetails =
          this.comicDetailService.loadComicDetailList(
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
      coverYears =
          this.comicDetailService.getCoverYears(
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
      coverMonths =
          this.comicDetailService.getCoverMonths(
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
      filterCount =
          this.comicDetailService.getFilterCount(
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
      totalCount = this.comicBookService.getComicBookCount();
    }
    return new LoadComicDetailsResponse(
        comicDetails, coverYears, coverMonths, totalCount, filterCount);
  }

  /**
   * Loads comics based on a set of ids received.
   *
   * @param principal the user principal
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/api/comics/details/load/ids",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-by-ids")
  @PreAuthorize("hasRole('READER')")
  @JsonView(ComicDetailsView.class)
  public LoadComicDetailsResponse loadComicDetailListById(
      final Principal principal, @RequestBody() final LoadComicDetailsByIdRequest request)
      throws LastReadException {
    final Set<Long> ids = request.getComicBookIds();
    log.debug("Loading comics by ids: {}", ids);
    final List<ComicDetail> comicDetails = this.comicDetailService.loadComicDetailListById(ids);
    final List<Integer> coverYears = this.comicDetailService.getCoverYears(ids);
    final List<Integer> coverMonths = this.comicDetailService.getCoverMonths(ids);
    return new LoadComicDetailsResponse(
        comicDetails, coverYears, coverMonths, ids.size(), ids.size());
  }

  /**
   * Loads comics based on a tag type and value
   *
   * @param principal the user principal
   * @param request the request body
   * @return the response body
   */
  @PostMapping(
      value = "/api/comics/details/load/tag",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-for-collection")
  @PreAuthorize("hasRole('READER')")
  @JsonView(ComicDetailsView.class)
  public LoadComicDetailsResponse loadComicDetailListForTag(
      final Principal principal, @RequestBody() final LoadComicDetailsForTagRequest request)
      throws LastReadException {
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final ComicTagType tagType = ComicTagType.forValue(request.getTagType());
    final String tagValue = request.getTagValue();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.debug(
        "Loading comics by for collection: type={} value={} size={} index={} sort by ={} [{}]",
        tagType,
        tagValue,
        pageSize,
        pageIndex,
        sortBy,
        sortDirection);
    final List<ComicDetail> comicDetails =
        this.comicDetailService.loadComicDetailListForTagType(
            pageSize, pageIndex, tagType, tagValue, sortBy, sortDirection);
    return new LoadComicDetailsResponse(
        comicDetails,
        this.comicDetailService.getCoverYears(tagType, tagValue),
        this.comicDetailService.getCoverMonths(tagType, tagValue),
        this.comicBookService.getComicBookCount(),
        this.comicDetailService.getFilterCount(tagType, tagValue));
  }

  /**
   * Loads unread comics for the requesting user.
   *
   * @param principal the user principal
   * @param request the request body
   * @return the comic detail list
   * @throws LastReadException if an error occurs
   */
  @PostMapping(
      value = "/api/comics/details/load/unread",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-unread")
  @PreAuthorize("hasRole('READER')")
  @JsonView(ComicDetailsView.class)
  public LoadComicDetailsResponse loadUnreadComicDetailList(
      final Principal principal, @RequestBody() final LoadUnreadComicDetailsRequest request)
      throws LastReadException {
    final String email = principal.getName();
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final boolean unreadOnly = request.isUnreadOnly();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.debug(
        "Loading {}} comics: size={} index={} sort by ={} [{}]",
        unreadOnly ? "unread" : "read",
        pageSize,
        pageIndex,
        sortBy,
        sortDirection);
    final List<ComicDetail> comicDetails =
        this.comicDetailService.loadUnreadComicDetails(
            email, unreadOnly, pageSize, pageIndex, sortBy, sortDirection);
    final long comicBookCount = this.comicBookService.getComicBookCount();
    final long filteredCount = this.lastReadService.getUnreadCountForUser(email);
    return new LoadComicDetailsResponse(
        comicDetails,
        Collections.emptyList(),
        Collections.emptyList(),
        comicBookCount,
        unreadOnly ? comicBookCount - filteredCount : filteredCount);
  }

  /**
   * Loads comic details for a reading list.
   *
   * @param principal the user principal
   * @param request the rquest body
   * @param readingListId the reading list id
   * @return the entries
   * @throws LastReadException if an error occurs
   * @throws ComicDetailException if an error occurs
   * @throws ReadingListException if an error occurs
   */
  @PostMapping(
      value = "/api/comics/details/load/readinglist/{readingListId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comic-book.load-for-reading-list")
  @PreAuthorize("hasRole('READER')")
  @JsonView(ComicDetailsView.class)
  public LoadComicDetailsResponse loadComicDetailsForReadingList(
      final Principal principal,
      @RequestBody() final LoadComicDetailsForReadingListRequest request,
      @PathVariable("readingListId") final long readingListId)
      throws LastReadException, ComicDetailException, ReadingListException {
    final String email = principal.getName();
    final int pageSize = request.getPageSize();
    final int pageIndex = request.getPageIndex();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.debug(
        "Loading comic details for a reading list: reading list={} size={} index={} sort by ={} [{}]",
        readingListId,
        pageSize,
        pageIndex,
        sortBy,
        sortDirection);

    final List<ComicDetail> comicDetails =
        this.comicDetailService.loadComicDetailsForReadingList(
            email, readingListId, pageSize, pageIndex, sortBy, sortDirection);

    return new LoadComicDetailsResponse(
        comicDetails,
        Collections.emptyList(),
        Collections.emptyList(),
        this.readingListService.getEntryCount(readingListId),
        this.readingListService.getEntryCount(readingListId));
  }
}
