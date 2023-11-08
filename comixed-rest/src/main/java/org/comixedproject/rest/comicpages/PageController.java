/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.rest.comicpages;

import static org.comixedproject.rest.comicbooks.ComicBookController.MISSING_COMIC_COVER_FILENAME;

import io.micrometer.core.annotation.Timed;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicpages.UpdatePageDeletionRequest;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.service.comicpages.PageException;
import org.comixedproject.service.comicpages.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>PageController</code> provides REST APIs for working with instances of {@link Page}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class PageController {
  @Autowired private PageService pageService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicBookAdaptor comicBookAdaptor;

  /**
   * Retrieves the content for a single comic page by comic id and page index.
   *
   * @param pageId the comic id
   * @return the page content
   * @throws PageException if an error occurs
   */
  @GetMapping(value = "/api/pages/{pageId}/content")
  @Timed(value = "comixed.page.get-content")
  public ResponseEntity<byte[]> getPageContent(@PathVariable("pageId") long pageId)
      throws PageException {
    log.info("Getting image content for page: pageId={}", pageId);
    return this.getResponseEntityForPage(this.pageService.getForId(pageId));
  }

  /**
   * Retrieves a page's content from either the page cache or the comic file itself.
   *
   * @param page the page
   * @return the content
   * @throws PageException if the page could not be found in the comic file
   */
  private ResponseEntity<byte[]> getResponseEntityForPage(Page page) throws PageException {
    log.debug("creating response entity for page: id={}", page.getId());
    byte[] content = this.pageCacheService.findByHash(page.getHash());

    if (content == null) {
      try {
        log.debug("Fetching content for page");
        content = this.comicBookAdaptor.loadPageContent(page.getComicBook(), page.getPageNumber());
        log.debug("Caching image for hash: {} bytes hash={}", content.length, page.getHash());
        this.pageCacheService.saveByHash(page.getHash(), content);
      } catch (AdaptorException error) {
        log.error("Failed to load page content", error);
      }
    }

    if (content == null) {
      content = this.doLoadMissingPageImage();
    }

    String type =
        this.fileTypeAdaptor.getType(new ByteArrayInputStream(content))
            + "/"
            + this.fileTypeAdaptor.getSubtype(new ByteArrayInputStream(content));
    log.debug("Page type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content != null ? content.length : 0)
        .header("Content-Disposition", "attachment; filename=\"" + page.getFilename() + "\"")
        .contentType(MediaType.valueOf(type))
        .cacheControl(CacheControl.maxAge(24, TimeUnit.DAYS))
        .body(content);
  }

  /**
   * Returns the page content for the given hash value.
   *
   * @param hash the page hash
   * @return the page content
   * @throws PageException if an error occurs
   */
  @GetMapping(value = "/api/pages/hashes/{hash}/content")
  @Timed(value = "comixed.page.get-content-for-hash")
  public ResponseEntity<byte[]> getPageForHash(@PathVariable("hash") final String hash)
      throws PageException {
    log.info("Getting image content for page hash: {}", hash);
    final Page page = this.pageService.getOneForHash(hash);
    if (page == null) return null;
    return this.getResponseEntityForPage(page);
  }

  /**
   * Updates the deletion state for individual pages, setting them as deleted.
   *
   * @param request the request body
   */
  @PostMapping(value = "/api/pages/deleted", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.page.deleted")
  public void markPagesForDeletion(@RequestBody() final UpdatePageDeletionRequest request) {
    final List<Long> ids = request.getIds();
    log.info("Marking {} page{} as deleted", ids.size(), ids.size() == 1 ? "" : "s");
    this.pageService.updatePageDeletion(ids, true);
  }

  /**
   * Updates the deletion state for individual pages, setting them as deleted.
   *
   * @param request the request body
   */
  @PostMapping(value = "/api/pages/undeleted", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.page.undeleted")
  public void unmarkPagesForDeletion(@RequestBody() final UpdatePageDeletionRequest request) {
    final List<Long> ids = request.getIds();
    log.info("Unmarking {} page{} as deleted", ids.size(), ids.size() == 1 ? "" : "s");
    this.pageService.updatePageDeletion(ids, false);
  }

  private byte[] doLoadMissingPageImage() {
    try (final InputStream input =
        this.getClass().getResourceAsStream(MISSING_COMIC_COVER_FILENAME)) {
      return input.readAllBytes();
    } catch (IOException error) {
      log.error("Failed to load missing page image", error);
      return null;
    }
  }
}
