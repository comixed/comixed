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
import java.util.ArrayList;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.*;
import org.comixedproject.service.comicbooks.*;
import org.comixedproject.service.comicpages.ComicPageException;
import org.comixedproject.service.comicpages.PageCacheService;
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
  /** Image used when no page is found. */
  public static final String MISSING_COMIC_COVER_FILENAME = "/images/missing-comic.png";

  @Autowired private ComicBookService comicBookService;
  @Autowired private ComicDetailService comicDetailService;
  @Autowired private ComicSelectionService comicSelectionService;
  @Autowired private PageCacheService pageCacheService;

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
    log.info("Getting comic: id={}", id);
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
    log.info("Marking comic book as deleted: id={}", id);
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
    log.info("Deleting comic metadata: id={}", id);
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
          this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));
      log.info("Deleting multiple comics: ids={}", ids.toArray());
      this.comicBookService.deleteComicBooksById(ids);

      this.comicSelectionService.clearSelectedComicBooks(new ArrayList<>(ids));
      session.setAttribute(LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(ids));
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
          this.comicSelectionService.decodeSelections(session.getAttribute(LIBRARY_SELECTIONS));

      log.info("Undeleting multiple comic: {}", ids.toArray());
      this.comicBookService.undeleteComicBooksById(new ArrayList<>(ids));

      this.comicSelectionService.clearSelectedComicBooks(ids);
      session.setAttribute(LIBRARY_SELECTIONS, this.comicSelectionService.encodeSelections(ids));
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
    log.info("Download comic book: id={}", id);
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
    log.info("Updating comicBook: id={}", id, comicBook);

    return this.comicBookService.updateComic(id, comicBook);
  }

  /**
   * Retrieves the cover page content for a comic.
   *
   * @param id the comic id
   * @return the page content
   * @throws ComicPageException if an error occurs
   */
  @GetMapping(value = "/api/comics/{id}/cover/content")
  @Timed(value = "comixed.comic-book.pages.get-cover")
  public ResponseEntity<byte[]> getCoverImage(@PathVariable("id") final long id)
      throws ComicPageException {
    log.info("Getting comic cover content: id={}", id);
    return this.pageCacheService.getCoverPageContent(id, MISSING_COMIC_COVER_FILENAME);
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
    log.info("Updating page order: comic id={}", id);
    this.comicBookService.savePageOrder(id, request.getEntries());
  }
}
