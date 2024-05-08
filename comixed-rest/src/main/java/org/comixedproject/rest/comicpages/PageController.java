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
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.comicpages.UpdatePageDeletionRequest;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.service.comicpages.PageException;
import org.comixedproject.service.comicpages.PageService;
import org.springframework.beans.factory.annotation.Autowired;
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
    return this.pageCacheService.getPageContent(pageId, MISSING_COMIC_COVER_FILENAME);
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
    return this.pageCacheService.getPageContent(hash, MISSING_COMIC_COVER_FILENAME);
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
    log.info("Marking {} page(s) as deleted", ids.size());
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
    log.info("Unmarking {} page(s) as deleted", ids.size());
    this.pageService.updatePageDeletion(ids, false);
  }
}
