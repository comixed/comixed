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

import static org.comixedproject.model.messaging.Constants.BLOCKED_PAGE_LIST_REMOVAL_TOPIC;
import static org.comixedproject.model.messaging.Constants.BLOCKED_PAGE_LIST_UPDATE_TOPIC;

import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.service.blockedpage.BlockedPageException;
import org.comixedproject.service.blockedpage.BlockedPageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

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
  @Autowired private SimpMessagingTemplate messagingTemplate;
  @Autowired private ObjectMapper objectMapper;

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
   * Blocks a page type.
   *
   * @param hash the page hash
   */
  @PostMapping(
      value = "/api/pages/blocked/{hash}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public void blockPage(@PathVariable("hash") final String hash) {
    log.info("Blocking similar pages: hash={}", hash);
    final BlockedPage result = this.blockedPageService.blockHash(hash);
    log.trace("Publishing blocked page update");
    try {
      this.messagingTemplate.convertAndSend(
          BLOCKED_PAGE_LIST_UPDATE_TOPIC,
          this.objectMapper.writerWithView(View.BlockedPageList.class).writeValueAsString(result));
    } catch (JsonProcessingException error) {
      log.error("Failed to publish blocked page update", error);
    }
  }

  /**
   * Updates the details for a blocked page.
   *
   * @param hash the page hash
   * @param blockedPage the updated details
   * @return the updated record
   */
  @PutMapping(value = "/api/pages/blocked/{hash}")
  @AuditableEndpoint
  @JsonView(View.BlockedPageDetail.class)
  public BlockedPage updateBlockedPage(
      @PathVariable("hash") final String hash, @RequestBody() final BlockedPage blockedPage)
      throws BlockedPageException {
    log.info(
        "Updating blocked page: hash={} label={}", blockedPage.getHash(), blockedPage.getHash());
    final BlockedPage response = this.blockedPageService.updateBlockedPage(hash, blockedPage);
    try {
      this.messagingTemplate.convertAndSend(
          BLOCKED_PAGE_LIST_UPDATE_TOPIC,
          this.objectMapper
              .writerWithView(View.BlockedPageList.class)
              .writeValueAsString(response));
    } catch (JsonProcessingException error) {
      log.error("Failed to publish blocked page update", error);
    }
    return response;
  }

  /**
   * Unblocks a page hash.
   *
   * @param hash the page hash
   * @throws BlockedPageException if an error occurs
   */
  @DeleteMapping(value = "/api/pages/blocked/{hash}", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public void unblockPage(@PathVariable("hash") final String hash) throws BlockedPageException {
    log.info("Unblocked pages with hash: {}", hash);
    final BlockedPage result = this.blockedPageService.unblockPage(hash);
    if (result != null) {
      log.trace("Publishing blocked page remove");
      try {
        this.messagingTemplate.convertAndSend(
            BLOCKED_PAGE_LIST_REMOVAL_TOPIC,
            this.objectMapper
                .writerWithView(View.BlockedPageDetail.class)
                .writeValueAsString(result));
      } catch (JsonProcessingException error) {
        log.error("Failed to publish blocked page remove", error);
      }
    }
  }

  /**
   * Generates and downloads a file containing the blocked page list.
   *
   * @return the blocked page file
   */
  @GetMapping(value = "/api/pages/blocked/file", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  public DownloadDocument downloadFile() throws IOException {
    log.info("Downloading blocked page file");
    return this.blockedPageService.createFile();
  }
}
