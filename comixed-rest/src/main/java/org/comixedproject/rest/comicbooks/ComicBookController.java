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

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicbooks.MarkComicsDeletedRequest;
import org.comixedproject.model.net.comicbooks.MarkComicsUndeletedRequest;
import org.comixedproject.model.net.comicbooks.SavePageOrderRequest;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.comicfiles.ComicFileService;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.views.View.ComicDetailsView;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
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
  @Autowired private ComicBookService comicBookService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private ComicFileService comicFileService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;

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
  public ComicBook deleteComic(@PathVariable("id") long id) throws ComicBookException {
    log.info("Marking comic for deletion: id={}", id);
    return this.comicBookService.deleteComic(id);
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
   * Sets the deleted flag for one or more comics.
   *
   * @param request the request body
   */
  @PostMapping(value = "/api/comics/mark/deleted", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comics.mark-many.deleted")
  public void markComicsDeleted(@RequestBody() final MarkComicsDeletedRequest request) {
    final List<Long> ids = request.getIds();
    log.debug("Deleting multiple comics: ids={}", ids.toArray());
    this.comicBookService.deleteComics(ids);
  }

  /**
   * Clears the deleted flag for one or more comics.
   *
   * @param request the request body
   * @throws Exception if an error occurs
   */
  @PostMapping(value = "/api/comics/mark/undeleted", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.comics.mark-many.undeleted")
  public void markComicsUndeleted(@RequestBody() final MarkComicsUndeletedRequest request)
      throws Exception {
    final List<Long> ids = request.getIds();
    log.debug("Undeleting multiple comic: {}", ids.toArray());
    this.comicBookService.undeleteComics(ids);
  }

  @GetMapping(value = "/api/comics/{id}/download")
  @Timed(value = "comixed.comic-book.download")
  public ResponseEntity<InputStreamResource> downloadComic(@PathVariable("id") long id)
      throws IOException, ComicBookException {
    log.info("Preparing to download comicBook: id={}", id);

    final ComicBook comicBook = this.comicBookService.getComic(id);
    if (comicBook == null) {
      log.error("No such comicBook");
      return null;
    }

    final byte[] content = this.comicBookService.getComicContent(comicBook);
    if (content == null) {
      log.error("No comicBook content found");
      return null;
    }

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + comicBook.getFilename() + "\"")
        .contentType(MediaType.parseMediaType(comicBook.getArchiveType().getMimeType()))
        .body(new InputStreamResource(new ByteArrayInputStream(content)));
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
   * @throws ComicBookException if an error occurs
   * @throws IOException if an error occurs
   * @throws AdaptorException if an error occurs
   */
  @GetMapping(value = "/api/comics/{id}/cover/content")
  @Timed(value = "comixed.comic-book.pages.get-cover")
  public ResponseEntity<byte[]> getCoverImage(@PathVariable("id") final long id)
      throws ComicBookException, IOException, AdaptorException {
    log.info("Getting cover for comicBook: id={}", id);
    final ComicBook comicBook = this.comicBookService.getComic(id);

    if (comicBook == null || comicBook.isMissing()) {
      throw new ComicBookException("comicBook file is missing");
    }

    if (comicBook.getPageCount() > 0) {
      final String filename = comicBook.getPage(0).getFilename();
      final Page page = comicBook.getPage(0);
      log.debug("Looking for cached image: hash={}", page.getHash());
      byte[] content = this.pageCacheService.findByHash(page.getHash());
      if (content == null) {
        log.debug("Loading page from archive");
        content = this.comicBookAdaptor.loadPageContent(comicBook, 0);
        this.pageCacheService.saveByHash(page.getHash(), content);
      }
      log.debug("Returning comicBook cover: filename={} size={}", filename, content.length);
      return this.getResponseEntityForImage(content, filename);
    } else {
      log.debug("ComicBook is unprocessed; getting the first image instead");
      return this.getResponseEntityForImage(
          this.comicFileService.getImportFileCover(comicBook.getFilename()), "cover-image");
    }
  }

  private ResponseEntity<byte[]> getResponseEntityForImage(byte[] content, String filename) {
    final ByteArrayInputStream inputStream = new ByteArrayInputStream(content);
    String type =
        this.fileTypeAdaptor.getType(inputStream)
            + "/"
            + this.fileTypeAdaptor.getSubtype(inputStream);
    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.valueOf(type))
        .body(content);
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
