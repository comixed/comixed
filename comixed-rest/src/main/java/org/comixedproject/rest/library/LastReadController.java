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

package org.comixedproject.rest.library;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.LastRead;
import org.comixedproject.model.net.library.GetLastReadDatesResponse;
import org.comixedproject.model.net.library.SetComicsReadRequest;
import org.comixedproject.service.library.LastReadException;
import org.comixedproject.service.library.LastReadService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

/**
 * <code>LastReadController</code> provides REST APIs for working with the last read dates for
 * comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LastReadController {
  static final int MAXIMUM = 100;

  @Autowired private LastReadService lastReadService;

  /**
   * Retrieves a batch of last read entries for a given user.
   *
   * @param principal the user principal
   * @param lastId the last record id returned
   * @return the response body
   * @throws LastReadException if an error occurs
   */
  @GetMapping(value = "/api/library/read", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.last-read.get-all")
  @JsonView(View.LastReadList.class)
  public GetLastReadDatesResponse getLastReadEntries(
      final Principal principal, @RequestParam("lastId") final long lastId)
      throws LastReadException {
    final String email = principal.getName();
    log.info("Loading last read entries for user: email={} threshold={}", email, lastId);
    List<LastRead> entries = this.lastReadService.getLastReadEntries(email, lastId, MAXIMUM + 1);
    final boolean lastPayload = entries.size() <= MAXIMUM;
    if (!lastPayload) {
      log.trace("Reduce entry list to {} records", MAXIMUM);
      entries = entries.subList(0, MAXIMUM);
    }
    return new GetLastReadDatesResponse(entries, lastPayload);
  }

  /**
   * Sets the last read state for a set of comics for a given user.
   *
   * @param principal the user principal
   * @param request the request body
   * @throws LastReadException if an error occurs
   */
  @PostMapping(
      value = "/api/library/read",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.last-read.set")
  @JsonView(View.LastReadList.class)
  public void setComicsReadState(
      final Principal principal, @RequestBody() SetComicsReadRequest request)
      throws LastReadException {
    final List<Long> ids = request.getIds();
    final boolean read = request.isRead();
    final String email = principal.getName();
    log.info(
        "Marking {} comic{} as {} for {}",
        ids.size(),
        ids.size() == 1 ? "" : "s",
        read ? "read" : "unread",
        email);
    this.lastReadService.setLastReadState(email, ids, read);
  }
}
