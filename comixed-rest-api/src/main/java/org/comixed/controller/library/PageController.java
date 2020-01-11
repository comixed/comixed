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

package org.comixed.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import org.comixed.model.library.Comic;
import org.comixed.model.library.DuplicatePage;
import org.comixed.model.library.Page;
import org.comixed.model.library.PageType;
import org.comixed.net.SetBlockingStateRequest;
import org.comixed.service.library.PageCacheService;
import org.comixed.service.library.PageException;
import org.comixed.service.library.PageService;
import org.comixed.utils.FileTypeIdentifier;
import org.comixed.views.View;
import org.comixed.views.View.PageList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PageController {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired private PageService pageService;
  @Autowired private PageCacheService pageCacheService;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;

  @PostMapping(
      value = "/pages/{id}/block/{hash}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetails.class)
  public Comic addBlockedPageHash(
      @PathVariable("id") final long pageId, @PathVariable("hash") String hash)
      throws PageException {
    this.logger.info("Blocking page hash: {}", hash);

    return this.pageService.addBlockedPageHash(pageId, hash);
  }

  @DeleteMapping(value = "/pages/hash/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  public int deleteAllWithHash(@PathVariable("hash") String hash) {
    this.logger.info("Marking all pages with hash as deleted: {}", hash);

    return this.pageService.deleteAllWithHash(hash);
  }

  @DeleteMapping(value = "/pages/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public boolean deletePage(@PathVariable("id") long id) {
    this.logger.info("Deleting page: id={}", id);

    return this.pageService.deletePage(id) != null;
  }

  @GetMapping(value = "/comics/{id}/pages", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(PageList.class)
  public List<Page> getAllPagesForComic(@PathVariable("id") long id) {
    this.logger.info("Getting all pages for comic: id={}", id);

    return this.pageService.getAllPagesForComic(id);
  }

  @GetMapping(value = "/pages/blocked", produces = MediaType.APPLICATION_JSON_VALUE)
  public List<String> getAllBlockedPageHashes() {
    this.logger.debug("Getting all blocked page hashes");

    return this.pageService.getAllBlockedPageHashes();
  }

  @GetMapping(value = "/pages/duplicates", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageList.class)
  public List<DuplicatePage> getDuplicatePages() {
    this.logger.info("Getting duplicate pages");

    return this.pageService.getDuplicatePages();
  }

  @GetMapping(
      value = "/comics/{id}/pages/{index}/content",
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<byte[]> getImageInComicByIndex(
      @PathVariable("id") long id, @PathVariable("index") int index) throws IOException {
    this.logger.debug("Getting image content for comic: id={} index={}", id, index);

    final Page page = this.pageService.getPageInComicByIndex(id, index);

    return this.getResponseEntityForPage(page);
  }

  private ResponseEntity<byte[]> getResponseEntityForPage(Page page) throws IOException {
    this.logger.debug("creating response entity for page: id={}", page.getId());
    byte[] content = this.pageCacheService.findByHash(page.getHash());

    if (content == null) {
      this.logger.debug("Fetching content for page");
      content = page.getContent();
      this.logger.debug("Caching image for hash: {} bytes hash={}", content.length, page.getHash());
      this.pageCacheService.saveByHash(page.getHash(), content);
    }

    String type =
        this.fileTypeIdentifier.typeFor(new ByteArrayInputStream(content))
            + "/"
            + this.fileTypeIdentifier.subtypeFor(new ByteArrayInputStream(content));
    this.logger.debug("Page type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content.length)
        .header("Content-Disposition", "attachment; filename=\"" + page.getFilename() + "\"")
        .contentType(MediaType.valueOf(type))
        .body(content);
  }

  @GetMapping(value = "/pages/{id}/content", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<byte[]> getPageContent(@PathVariable("id") long id) throws IOException {
    this.logger.info("Getting page content: id={}", id);
    final Page page = this.pageService.findById(id);

    if (page != null) {
      return this.getResponseEntityForPage(page);
    }

    this.logger.warn("No such page");
    return null;
  }

  @GetMapping(
      value = "/comics/{comic_id}/pages/{index}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  public Page getPageInComicByIndex(
      @PathVariable("comic_id") long comicId, @PathVariable("index") int index) {
    this.logger.info("Getting page in comic: comic id={} page index={}", comicId, index);

    return this.pageService.getPageInComicByIndex(comicId, index);
  }

  @GetMapping(value = "/pages/types", produces = MediaType.APPLICATION_JSON_VALUE)
  public Iterable<PageType> getPageTypes() {
    this.logger.info("Fetching page types");

    return this.pageService.getPageTypes();
  }

  @DeleteMapping(value = "/pages/{id}/unblock/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicDetails.class)
  public Comic removeBlockedPageHash(
      @PathVariable("id") final long pageId, @PathVariable("hash") String hash)
      throws PageException {
    this.logger.info("Unblocking page hash: {}", hash);

    return this.pageService.removeBlockedPageHash(pageId, hash);
  }

  @PutMapping(value = "/pages/hash/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  public int undeleteAllWithHash(@PathVariable("hash") String hash) {
    this.logger.info("Marking all pages with hash as undeleted: {}", hash);

    return this.pageService.undeleteAllWithHash(hash);
  }

  @PostMapping(value = "/pages/{id}/undelete", produces = MediaType.APPLICATION_JSON_VALUE)
  public boolean undeletePage(@PathVariable("id") long id) {
    this.logger.info("Undeleting page: id={}", id);

    return this.pageService.undeletePage(id) != null;
  }

  @PutMapping(value = "/pages/{id}/type", produces = MediaType.APPLICATION_JSON_VALUE)
  public Page updateTypeForPage(
      @PathVariable("id") long id, @RequestParam("type_id") long pageTypeId) throws PageException {
    this.logger.info("Setting page type: id={} typeId={}", id, pageTypeId);

    return this.pageService.updateTypeForPage(id, pageTypeId);
  }

  @PostMapping(
      value = "/pages/hashes/blocking",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageList.class)
  public List<DuplicatePage> setBlockingState(
      @RequestBody() final SetBlockingStateRequest request) {
    this.logger.info(
        "Setting blocked state for {} hash{} to {}",
        request.getHashes().size(),
        request.getHashes().size() == 1 ? "" : "es",
        request.getBlocked());

    return this.pageService.setBlockingState(request.getHashes(), request.getBlocked());
  }
}
