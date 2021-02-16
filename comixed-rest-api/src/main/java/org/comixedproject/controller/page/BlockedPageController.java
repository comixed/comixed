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

package org.comixedproject.controller.page;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.utils.IOUtils;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.net.library.AddBlockedPageHashRequest;
import org.comixedproject.model.page.Page;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.page.BlockedPageHashService;
import org.comixedproject.service.page.PageCacheService;
import org.comixedproject.utils.FileTypeIdentifier;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>BlockedPageController</code> provides REST endpoints for working with instances of {@link
 * org.comixedproject.model.page.BlockedPageHash}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/api")
@Log4j2
public class BlockedPageController {
  @Autowired private BlockedPageHashService blockedPageHashService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;

  /**
   * Adds a page has to the list of blocked page.
   *
   * @param request the request body
   */
  @PostMapping(
      value = "/pages/blocked",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetailsView.class)
  @AuditableEndpoint
  public void addBlockedPageHash(@RequestBody() final AddBlockedPageHashRequest request) {
    final String hash = request.getHash();
    log.info("Blocking page hash: {}", hash);

    this.blockedPageHashService.addHash(hash);
  }

  /**
   * Removes the blocked state for a page hash.
   *
   * @param hash the page hash
   */
  @DeleteMapping(value = "/pages/blocked/{hash}")
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint
  public void deleteBlockedPageHash(@PathVariable("hash") final String hash) {
    log.info("Unblocking page hash: {}", hash);
    this.blockedPageHashService.deleteHash(hash);
  }

  /**
   * Retrieves the content of a blocked page by the page hash.
   *
   * @param hash the page hash
   * @return the page content
   * @throws ComicException if no such comic is found
   * @throws IOException if an error occurs loading the content
   */
  @GetMapping(value = "/pages/blocked/{hash}/content")
  @AuditableEndpoint
  public ResponseEntity<byte[]> getBlockedPageContent(@PathVariable("hash") final String hash)
      throws ComicException, IOException {
    log.info("Getting blocked page content: {}", hash);
    return this.getResponseEntityForPage(hash);
  }

  /**
   * Retrieves a page's content from either the page cache or the comic file itself.
   *
   * @param hash the page hash
   * @return the content
   * @throws ComicException if the page could not be found in the comic file
   */
  private ResponseEntity<byte[]> getResponseEntityForPage(final String hash)
      throws ComicException, IOException {
    log.debug("Loading blocked page hash content");
    byte[] content = this.pageCacheService.findByHash(hash);
    String filename = "missing.png";

    if (content == null) {
      log.trace("Content not cached: finding existing page");
      final Page page = this.blockedPageHashService.findPageForHash(hash);
      if (page != null) {
        filename = page.getFilename();
        log.trace(
            "Loading content from archive: {}@{}",
            page.getFilename(),
            page.getComic().getFilename());
        final ArchiveAdaptor adaptor =
            this.comicFileHandler.getArchiveAdaptorFor(page.getComic().getArchiveType());
        try {
          content = adaptor.loadSingleFile(page.getComic(), page.getFilename());
        } catch (ArchiveAdaptorException error) {
          throw new ComicException("failed to load page content", error);
        }
        log.debug("Caching image for hash: {} bytes hash={}", content.length, page.getHash());
        try {
          this.pageCacheService.saveByHash(hash, content);
        } catch (IOException error) {
          log.error("Failed to add comic page to cache", error);
        }
      } else {
        log.trace("Not found: using missing page image");
        content =
            IOUtils.toByteArray(this.getClass().getResourceAsStream("/images/missing-page.png"));
      }
    }

    String type =
        String.format(
            "%s/%s",
            this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content)),
            this.fileTypeIdentifier.subtypeFor(new ByteArrayInputStream(content)));
    log.debug("Page type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.valueOf(type))
        .body(content);
  }
}
