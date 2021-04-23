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

package org.comixedproject.controller.library;

import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.Principal;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.messaging.Constants;
import org.comixedproject.model.net.library.GetLastReadDatesRequest;
import org.comixedproject.model.net.library.GetLastReadDatesResponse;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@Log4j2
public class LastReadController {
  static final int MAXIMUM = 100;

  @Autowired private LastReadService lastReadService;
  @Autowired private SimpMessagingTemplate messagingTemplate;
  @Autowired private ObjectMapper objectMapper;

  /**
   * Retrieves a batch of last read entries for a given user.
   *
   * @param principal the user principal
   * @param request the request body
   * @return the response body
   * @throws LastReadException if an error occurs
   */
  @PostMapping(
      value = "/api/library/read",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.LastReadList.class)
  @AuditableEndpoint
  public GetLastReadDatesResponse getLastReadEntries(
      final Principal principal, @RequestBody() final GetLastReadDatesRequest request)
      throws LastReadException {
    final String email = principal.getName();
    final long threshold = request.getLastId();
    log.info("Loading last read entries for user: email={} threshold={}", email, threshold);
    List<LastRead> entries = this.lastReadService.getLastReadEntries(email, threshold, MAXIMUM + 1);
    final boolean lastPayload = entries.size() <= MAXIMUM;
    if (!lastPayload) {
      log.trace("Reduce entry list to {} records", MAXIMUM);
      entries = entries.subList(0, MAXIMUM);
    }
    return new GetLastReadDatesResponse(entries, lastPayload);
  }

  /**
   * Marks a comic as read by the current user.
   *
   * @param principal the user principal
   * @param comicId the comic id
   * @return the last read entry
   * @throws LastReadException if an error occurs
   */
  @PostMapping(
      value = "/api/comic/{comicId}/read",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  @JsonView(View.LastReadList.class)
  public LastRead markAsRead(final Principal principal, @PathVariable("comicId") final long comicId)
      throws LastReadException {
    final String email = principal.getName();
    log.info("Marking comic as read for {}: id={}", email, comicId);
    final var response = this.lastReadService.setLastReadState(email, comicId, true);
    log.trace("Publishing updated last read entry");
    try {
      this.messagingTemplate.convertAndSendToUser(
          email,
          Constants.LAST_READ_UPDATE_TOPIC,
          this.objectMapper.writerWithView(View.LastReadList.class).writeValueAsString(response));
    } catch (JsonProcessingException error) {
      log.error("Failed to publish last read update", error);
    }
    return response;
  }

  /**
   * Marks a comic as unread by the current user.
   *
   * @param principal the user principal
   * @param comicId the comic id
   * @return the removed last read entry
   * @throws LastReadException if an error occurs
   */
  @DeleteMapping(value = "/api/comic/{comicId}/read", produces = MediaType.APPLICATION_JSON_VALUE)
  @AuditableEndpoint
  @JsonView(View.LastReadList.class)
  public LastRead markAsUnread(
      final Principal principal, @PathVariable("comicId") final long comicId)
      throws LastReadException {
    final String email = principal.getName();
    log.info("Marking comic as read for {}: id={}", email, comicId);
    final var response = this.lastReadService.setLastReadState(email, comicId, false);
    log.trace("Publishing updated last read entry");
    try {
      this.messagingTemplate.convertAndSendToUser(
          email,
          Constants.LAST_READ_REMOVAL_TOPIC,
          this.objectMapper.writerWithView(View.LastReadList.class).writeValueAsString(response));
    } catch (JsonProcessingException error) {
      log.error("Failed to publish last read removal", error);
    }
    return response;
  }
}
