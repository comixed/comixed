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

package org.comixedproject.controller.comic;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.archive.ArchiveAdaptor;
import org.comixedproject.adaptors.archive.ArchiveAdaptorException;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.handlers.ComicFileHandler;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.Page;
import org.comixedproject.model.comic.PageType;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.model.net.SetBlockedPageRequest;
import org.comixedproject.model.net.SetDeletedStateRequest;
import org.comixedproject.model.net.SetPageTypeRequest;
import org.comixedproject.model.net.library.AddBlockedPageHashRequest;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.service.comic.PageCacheService;
import org.comixedproject.service.comic.PageException;
import org.comixedproject.service.comic.PageService;
import org.comixedproject.service.library.BlockedPageHashService;
import org.comixedproject.utils.FileTypeIdentifier;
import org.comixedproject.views.View;
import org.comixedproject.views.View.PageList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Log4j2
public class PageController {
  @Autowired private PageService pageService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private BlockedPageHashService blockedPageHashService;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;
  @Autowired private ComicFileHandler comicFileHandler;

  /**
   * Adds a page has to the list of blocked pages.
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

  @DeleteMapping(value = "/pages/hash/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public int deleteAllWithHash(@PathVariable("hash") String hash) {
    log.info("Marking all pages with hash as deleted: {}", hash);

    return this.pageService.deleteAllWithHash(hash);
  }

  /**
   * Marks a page for deletion.
   *
   * @param id the page id
   * @return the parent comic
   */
  @DeleteMapping(value = "/pages/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicDetailsView.class)
  @AuditableEndpoint
  public Comic deletePage(@PathVariable("id") long id) {
    log.info("Deleting page: id={}", id);

    return this.pageService.deletePage(id);
  }

  @GetMapping(value = "/comics/{id}/pages", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(PageList.class)
  @AuditableEndpoint
  public List<Page> getAllPagesForComic(@PathVariable("id") long id) {
    log.info("Getting all pages for comic: id={}", id);

    return this.pageService.getAllPagesForComic(id);
  }

  @GetMapping(value = "/pages/blocked", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public List<String> getAllBlockedPageHashes() {
    log.debug("Getting all blocked page hashes");

    return this.blockedPageHashService.getAllHashes();
  }

  @GetMapping(value = "/pages/duplicates", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageList.class)
  @AuditableEndpoint
  public List<DuplicatePage> getDuplicatePages() {
    log.info("Getting duplicate pages");

    return this.pageService.getDuplicatePages();
  }

  /**
   * Retrieves the content for a single comic page by comic id and page index.
   *
   * @param pageId the comic id
   * @return the page content
   * @throws ComicException if an error occurs
   */
  @GetMapping(value = "/pages/{pageId}/content", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public ResponseEntity<byte[]> getPageContent(@PathVariable("pageId") long pageId)
      throws ComicException {
    log.debug("Getting image content for page: pageId={}", pageId);
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
        this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content))
            + "/"
            + this.fileTypeIdentifier.subtypeFor(new ByteArrayInputStream(content));
    log.debug("Page type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + page.getFilename() + "\"")
        .contentType(MediaType.valueOf(type))
        .body(content);
  }

  /**
   * Retrieves the content for a page by comic id and page index.
   *
   * @param comicId the comic id
   * @param index the page index
   * @return the page content
   * @throws ComicException if the comic is invalid or the page wasn't found
   */
  @GetMapping(
      value = "/comics/{comic_id}/pages/{index}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public Page getPageInComicByIndex(
      @PathVariable("comic_id") long comicId, @PathVariable("index") int index)
      throws ComicException {
    log.info("Getting page in comic: comic id={} page index={}", comicId, index);

    return this.pageService.getPageInComicByIndex(comicId, index);
  }

  @GetMapping(value = "/pages/types", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public Iterable<PageType> getPageTypes() {
    log.info("Fetching page types");

    return this.pageService.getPageTypes();
  }

  /**
   * Removes the blocked state for a page hash.
   *
   * @param hash the page hash
   */
  @DeleteMapping(value = "/pages/blocked/{hash}")
  @PreAuthorize("hasRole('ADMIN')")
  @AuditableEndpoint
  public void deleteBlockedPageHash(@PathVariable("hash") String hash) {
    log.info("Unblocking page hash: {}", hash);
    this.blockedPageHashService.deleteHash(hash);
  }

  @PutMapping(value = "/pages/hash/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public int undeleteAllWithHash(@PathVariable("hash") String hash) {
    log.info("Marking all pages with hash as undeleted: {}", hash);

    return this.pageService.undeleteAllWithHash(hash);
  }

  /**
   * Unmarks the page for deletion.
   *
   * @param id the page id
   * @return the parent comic
   */
  @PostMapping(value = "/pages/{id}/undelete", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @JsonView(View.ComicDetailsView.class)
  @AuditableEndpoint
  public Comic undeletePage(@PathVariable("id") long id) {
    log.info("Undeleting page: id={}", id);

    return this.pageService.undeletePage(id);
  }

  @PutMapping(value = "/pages/{id}/type", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.PageDetails.class)
  @AuditableEndpoint
  public Page updateTypeForPage(
      @PathVariable("id") long id, @RequestBody() SetPageTypeRequest request) throws PageException {
    String typeName = request.getTypeName();
    log.info("Setting page type: id={} typeName={}", id, typeName);

    return this.pageService.updateTypeForPage(id, typeName);
  }

  /**
   * Adds the given hash to the list of blocked hashes.
   *
   * @param request the request body
   */
  @PostMapping(
      value = "/pages/hashes/blocking",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  public void addBlockedPageHash(@RequestBody() final SetBlockedPageRequest request) {
    log.info("Blocking pages with hash: {}", request.getHash());

    this.blockedPageHashService.addHash(request.getHash());
  }

  @PostMapping(
      value = "/pages/hashes/deleted",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageList.class)
  @AuditableEndpoint
  public List<DuplicatePage> setDeletedState(@RequestBody() final SetDeletedStateRequest request) {
    final List<String> hashes = request.getHashes();
    log.info(
        "{}arking {} page hash{} for deletion",
        request.getDeleted().booleanValue() ? "M" : "Unm",
        hashes.size(),
        hashes.size() == 1 ? "" : "es");
    this.pageService.setDeletedState(hashes, request.getDeleted());

    return this.pageService.getDuplicatePages();
  }
}
