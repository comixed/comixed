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

package org.comixedproject.rest.comicpages;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpSession;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.blockedpage.DeleteBlockedPagesRequest;
import org.comixedproject.model.net.blockedpage.MarkPageWithHashRequest;
import org.comixedproject.model.net.blockedpage.UnmarkPageWithHashRequest;
import org.comixedproject.model.net.comicpages.SetBlockedPageRequest;
import org.comixedproject.service.comicpages.BlockedHashException;
import org.comixedproject.service.comicpages.BlockedHashService;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.library.DuplicatePageException;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * <code>BlockedHashController</code> provides endpoints for working with instances of {@link
 * BlockedHash}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class BlockedHashController {
  @Autowired private BlockedHashService blockedHashService;
  @Autowired private ComicPageService comicPageService;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;
  @Autowired private SelectedHashManager selectedHashManager;

  /**
   * Retrieves the list of all blocked pages.
   *
   * @return the list of blocked page hashes
   */
  @GetMapping(value = "/api/pages/blocked", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.blocked-hash.get-all")
  @JsonView(View.BlockedHashList.class)
  public List<BlockedHash> getAll() {
    log.info("Load all blocked pages");
    return this.blockedHashService.getAll();
  }

  /**
   * Returns a single blocked page by its hash.
   *
   * @param hash the page hash
   * @return the blocked page
   * @throws BlockedHashException if an error occurs
   */
  @GetMapping(value = "/api/pages/blocked/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.blocked-hash.get-one")
  public BlockedHash getByHash(@PathVariable("hash") final String hash)
      throws BlockedHashException {
    log.info("Loading blocked page: hash={}", hash);
    return this.blockedHashService.getByHash(hash);
  }

  /**
   * Updates the details for a blocked page.
   *
   * @param hash the page hash
   * @param blockedHash the updated details
   * @return the updated record
   * @throws DuplicatePageException if an error occurs
   */
  @PutMapping(value = "/api/pages/blocked/{hash}")
  @JsonView(View.BlockedHashDetail.class)
  @Timed(value = "comixed.blocked-hash.update")
  @PreAuthorize("hasRole('ADMIN')")
  public BlockedHash updateBlockedPage(
      @PathVariable("hash") final String hash, @RequestBody() final BlockedHash blockedHash)
      throws DuplicatePageException {
    log.info(
        "Updating blocked page: hash={} label={}", blockedHash.getHash(), blockedHash.getHash());
    return this.blockedHashService.updateBlockedPage(hash, blockedHash);
  }

  /**
   * Blocks pages by type.
   *
   * @param request the request body
   */
  @PostMapping(
      value = "/api/pages/blocked/add",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.add")
  public void blockPageHashes(@RequestBody() final SetBlockedPageRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Block {} hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    this.blockedHashService.blockPages(hashes);
  }

  /**
   * Marks all comics with hashes from a givens et for deletion.
   *
   * @param request the request body
   */
  @PostMapping(value = "/api/pages/blocked/mark", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.mark-pages")
  public void markPagesWithHash(@RequestBody() final MarkPageWithHashRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Marking pages with hash for deletion");
    this.comicPageService.markPagesWithHashForDeletion(hashes);
  }

  /**
   * Unblocks pages by hash.
   *
   * @param request the request body
   */
  @PostMapping(
      value = "/api/pages/blocked/remove",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.unblock-pages")
  public void unblockPageHashes(@RequestBody() final SetBlockedPageRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Unblock {} hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    this.blockedHashService.unblockPages(hashes);
  }

  /**
   * Unmarks all comics with hashes from a givens et for deletion.
   *
   * @param request the request body
   */
  @PostMapping(value = "/api/pages/blocked/unmark", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.unmark")
  public void unmarkPagesWithHash(@RequestBody() final UnmarkPageWithHashRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Unmarking pages with hash for deletion");
    this.comicPageService.unmarkPagesWithHashForDeletion(hashes);
  }

  /**
   * Generates and downloads a file containing the blocked page list.
   *
   * @return the blocked page file
   * @throws IOException if an error occurs
   */
  @GetMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.blocked-hash.download")
  public DownloadDocument downloadFile() throws IOException {
    log.info("Downloading blocked page file");
    return this.blockedHashService.createFile();
  }

  /**
   * Processes an uploaded blocked page file.
   *
   * @param file the uploaded file
   * @return the updated blocked page list
   * @throws BlockedHashException if a service exception occurs
   * @throws IOException if a file exception occurs
   */
  @PostMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.BlockedHashList.class)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.upload")
  public List<BlockedHash> uploadFile(final MultipartFile file)
      throws BlockedHashException, IOException {
    log.info("Received uploaded blocked page file: {}", file.getOriginalFilename());
    return this.blockedHashService.uploadFile(file.getInputStream());
  }

  /**
   * Deletes a set of blocked pages by their hash value.
   *
   * @param request the request body
   * @return the list of deleted blocked page hashes
   */
  @PostMapping(
      value = "/api/pages/blocked/delete",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.BlockedHashList.class)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.delete-pages")
  public List<String> deleteBlockedPages(@RequestBody() final DeleteBlockedPagesRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Deleting {} blocked hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    return this.blockedHashService.deleteBlockedPages(hashes);
  }

  /**
   * Retrieves the thumbnail image for a blocked page hash.
   *
   * @param hash the page has
   * @return the image
   * @throws BlockedHashException if the hash is not found
   */
  @GetMapping(value = "/api/pages/blocked/{hash}/content")
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.get-content")
  public ResponseEntity<byte[]> getThumbnail(@PathVariable("hash") final String hash)
      throws BlockedHashException {
    log.info("Loading thumbnail for blocked hash: {}", hash);
    final byte[] content = this.blockedHashService.getThumbnail(hash);
    String type =
        this.fileTypeAdaptor.getType(new ByteArrayInputStream(content))
            + "/"
            + this.fileTypeAdaptor.getSubtype(new ByteArrayInputStream(content));
    log.debug("ComicPage type: {}", type);

    return ResponseEntity.ok()
        .contentLength(content != null ? content.length : 0)
        .header("Content-Disposition", String.format("attachment; filename=\"%s.%s\"", hash, type))
        .contentType(MediaType.valueOf(type))
        .cacheControl(CacheControl.maxAge(24, TimeUnit.DAYS))
        .body(content);
  }

  /**
   * Marks the selected page hashes as blocked.
   *
   * @param session the session
   */
  @PostMapping(
      value = "/api/pages/blocked/add/selected",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.mark-selected-hashes")
  public void blockSelectedHashes(final HttpSession session) {
    log.info("Blocking selected hashes");
    this.blockedHashService.blockPages(this.selectedHashManager.load(session).stream().toList());
    this.selectedHashManager.clearSelections(session);
  }

  /**
   * Unmarks the selected page hashes as blocked.
   *
   * @param session the session
   */
  @PostMapping(
      value = "/api/pages/blocked/remove/selected",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.blocked-hash.mark-selected-hashes")
  public void unblockSelectedHashes(final HttpSession session) {
    log.info("Unblocking selected hashes");
    this.blockedHashService.unblockPages(this.selectedHashManager.load(session).stream().toList());
    this.selectedHashManager.clearSelections(session);
  }
}
