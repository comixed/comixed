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

package org.comixedproject.controller.blockedpage;

import com.fasterxml.jackson.annotation.JsonView;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.GenericResponse;
import org.comixedproject.model.net.SetBlockedPageRequest;
import org.comixedproject.model.net.blockedpage.DeleteBlockedPagesRequest;
import org.comixedproject.model.net.blockedpage.SetBlockedPageDeletionFlagRequest;
import org.comixedproject.model.net.blockedpage.SetBlockedPageDeletionFlagResponse;
import org.comixedproject.service.blockedpage.BlockedPageException;
import org.comixedproject.service.blockedpage.BlockedPageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * <code>BlockedPageController</code> provides endpoints for working with instances of {@link
 * BlockedPage}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class BlockedPageController {
  @Autowired private BlockedPageService blockedPageService;

  /**
   * Retrieves the list of all blocked pages.
   *
   * @return the list of blocked page hashes
   */
  @GetMapping(value = "/api/pages/blocked", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.BlockedPageList.class)
  public List<BlockedPage> getAll() {
    log.info("Load all blocked pages");
    return this.blockedPageService.getAll();
  }

  /**
   * Returns a single blocked page by its hash.
   *
   * @param hash the page hash
   * @return the blocked page
   * @throws BlockedPageException if an error occurs
   */
  @GetMapping(value = "/api/pages/blocked/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  public BlockedPage getByHash(@PathVariable("hash") final String hash)
      throws BlockedPageException {
    log.info("Loading blocked page: hash={}", hash);
    return this.blockedPageService.getByHash(hash);
  }

  /**
   * Updates the details for a blocked page.
   *
   * @param hash the page hash
   * @param blockedPage the updated details
   * @return the updated record
   * @throws BlockedPageException if an error occurs
   */
  @PutMapping(value = "/api/pages/blocked/{hash}")
  @AuditableEndpoint
  @JsonView(View.BlockedPageDetail.class)
  @PreAuthorize("hasRole('ADMIN')")
  public BlockedPage updateBlockedPage(
      @PathVariable("hash") final String hash, @RequestBody() final BlockedPage blockedPage)
      throws BlockedPageException {
    log.info(
        "Updating blocked page: hash={} label={}", blockedPage.getHash(), blockedPage.getHash());
    return this.blockedPageService.updateBlockedPage(hash, blockedPage);
  }

  /**
   * Blocks pages by type.
   *
   * @param request the request body
   * @return the generic response
   */
  @PostMapping(
      value = "/api/pages/blocked/add",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  @JsonView(View.BlockedPageDetail.class)
  @PreAuthorize("hasRole('ADMIN')")
  public GenericResponse blockPageHashes(@RequestBody() final SetBlockedPageRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Block {} hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    this.blockedPageService.blockPages(hashes);
    return new GenericResponse(true);
  }

  /**
   * Unblocks pages by hash.
   *
   * @param request the request body
   * @throws BlockedPageException if an error occurs
   * @return the generic response
   */
  @PostMapping(
      value = "/api/pages/blocked/remove",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  @JsonView(View.GenericResponseView.class)
  @PreAuthorize("hasRole('ADMIN')")
  public GenericResponse unblockPageHashes(@RequestBody() final SetBlockedPageRequest request)
      throws BlockedPageException {
    final List<String> hashes = request.getHashes();
    log.info("Unblock {} hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    this.blockedPageService.unblockPages(hashes);
    return new GenericResponse(true);
  }

  /**
   * Generates and downloads a file containing the blocked page list.
   *
   * @return the blocked page file
   * @throws IOException if an error occurs
   */
  @GetMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public DownloadDocument downloadFile() throws IOException {
    log.info("Downloading blocked page file");
    return this.blockedPageService.createFile();
  }

  /**
   * Processes an uploaded blocked page file.
   *
   * @param file the uploaded file
   * @return the updated blocked page list
   * @throws BlockedPageException if a service exception occurs
   * @throws IOException if a file exception occurs
   */
  @PostMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  @JsonView(View.BlockedPageList.class)
  @PreAuthorize("hasRole('ADMIN')")
  public List<BlockedPage> uploadFile(final MultipartFile file)
      throws BlockedPageException, IOException {
    log.info("Received uploaded blocked page file: {}", file.getOriginalFilename());
    return this.blockedPageService.uploadFile(file.getInputStream());
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
  @AuditableEndpoint
  @JsonView(View.BlockedPageList.class)
  @PreAuthorize("hasRole('ADMIN')")
  public List<String> deleteBlockedPages(@RequestBody() final DeleteBlockedPagesRequest request) {
    final List<String> hashes = request.getHashes();
    log.info("Deleting {} blocked hash{}", hashes.size(), hashes.size() == 1 ? "" : "es");
    return this.blockedPageService.deleteBlockedPages(hashes);
  }

  /**
   * Sets the deleted flag for all pages that have a hash value in a given list.
   *
   * @param request the request body
   * @return the response body
   */
  @PostMapping(value = "/api/pages/blocked/mark", consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.GenericResponseView.class)
  @PreAuthorize("hasRole('ADMIN')")
  public SetBlockedPageDeletionFlagResponse setBlockedPageDeletionFlag(
      @RequestBody() final SetBlockedPageDeletionFlagRequest request) {
    final List<String> hashes = request.getHashes();
    final boolean deleted = request.isDeleted();

    log.info(
        "{} {} page{} for deletion",
        deleted ? "Marking" : "Clearing",
        hashes.size(),
        hashes.size() == 1 ? "" : "s");
    return new SetBlockedPageDeletionFlagResponse(
        deleted, this.blockedPageService.setBlockedPageDeletionFlag(hashes, deleted));
  }
}
