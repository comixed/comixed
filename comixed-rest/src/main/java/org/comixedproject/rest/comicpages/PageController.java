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

import com.fasterxml.jackson.annotation.JsonView;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.adaptors.handlers.ComicFileHandler;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.service.comicbooks.ComicException;
import org.comixedproject.service.comicpages.PageCacheService;
import org.comixedproject.service.comicpages.PageException;
import org.comixedproject.service.comicpages.PageService;
import org.comixedproject.views.View;
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
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private ComicFileHandler comicFileHandler;

  /**
   * Marks a page for deletion.
   *
   * @param id the page id
   * @return the parent comic
   * @throws PageException if the id is invalid
   */
  @DeleteMapping(value = "/api/pages/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicDetailsView.class)
  @AuditableEndpoint
  public Comic deletePage(@PathVariable("id") long id) throws PageException {
    log.info("Marking page for deletion: id={}", id);
    return this.pageService.deletePage(id);
  }

  /**
   * Retrieves the content for a single comic page by comic id and page index.
   *
   * @param pageId the comic id
   * @return the page content
   * @throws ComicException if an error occurs
   * @throws PageException if an error occurs
   */
  @GetMapping(value = "/api/pages/{pageId}/content")
  @AuditableEndpoint
  public ResponseEntity<byte[]> getPageContent(@PathVariable("pageId") long pageId)
      throws ComicException, PageException {
    log.info("Getting image content for page: pageId={}", pageId);
    return this.getResponseEntityForPage(this.pageService.getForId(pageId));
  }

  /**
   * Retrieves a page's content from either the page cache or the comic file itself.
   *
   * @param page the page
   * @return the content
   * @throws ComicException if the page could not be found in the comic file
   */
  private ResponseEntity<byte[]> getResponseEntityForPage(Page page) throws ComicException {
    log.debug("creating response entity for page: id={}", page.getId());
    byte[] content = this.pageCacheService.findByHash(page.getHash());

    if (content == null) {
      log.debug("Fetching content for page");
      final ArchiveAdaptor adaptor =
          this.comicFileHandler.getArchiveAdaptorFor(page.getComic().getArchiveType());
      try {
        content = adaptor.loadSingleFile(page.getComic(), page.getFilename());
      } catch (ArchiveAdaptorException error) {
        throw new ComicException("failed to load page content", error);
      }
      log.debug("Caching image for hash: {} bytes hash={}", content.length, page.getHash());
      try {
        this.pageCacheService.saveByHash(page.getHash(), content);
      } catch (IOException error) {
        log.error("Failed to add comic page to cache", error);
      }
    }

    String type =
        this.fileTypeAdaptor.typeFor(new ByteArrayInputStream(content))
            + "/"
            + this.fileTypeAdaptor.subtypeFor(new ByteArrayInputStream(content));
    log.debug("Page type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + page.getFilename() + "\"")
        .contentType(MediaType.valueOf(type))
        .body(content);
  }

  /**
   * Returns the page content for the given hash value.
   *
   * @param hash the page hash
   * @return the page content
   * @throws ComicException if an error occurs
   */
  @GetMapping(value = "/api/pages/hashes/{hash}/content")
  @AuditableEndpoint
  public ResponseEntity<byte[]> getPageForHash(@PathVariable("hash") final String hash)
      throws ComicException {
    log.info("Getting image content for page hash: {}", hash);
    return this.getResponseEntityForPage(this.pageService.getOneForHash(hash));
  }

  /**
   * Retrieves the content for a page by comic id and page index.
   *
   * @param comicId the comic id
   * @param index the page index
   * @return the page content
   * @throws ComicException if the comic is invalid or the page wasn't found
   */
  @GetMapping(value = "/comics/{id}/pages/{index}", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public Page getPageInComicByIndex(
      @PathVariable("id") long comicId, @PathVariable("index") int index) throws ComicException {
    log.info("Getting page in comic: comic id={} page index={}", comicId, index);

    return this.pageService.getPageInComicByIndex(comicId, index);
  }

  /**
   * Unmarks the page for deletion.
   *
   * @param id the page id
   * @return the parent comic
   * @throws PageException if an error occurs
   */
  @PostMapping(value = "/api/pages/{id}/undelete", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicDetailsView.class)
  @AuditableEndpoint
  public Comic undeletePage(@PathVariable("id") long id) throws PageException {
    log.info("Undeleting page: id={}", id);
    return this.pageService.undeletePage(id);
  }
}
