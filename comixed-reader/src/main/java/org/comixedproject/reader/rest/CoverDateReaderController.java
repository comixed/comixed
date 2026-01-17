/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

package org.comixedproject.reader.rest;

import static org.comixedproject.reader.rest.LibraryReaderController.API_ROOT;

import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>PublisherReaderController</code> provides endpoints for loading directories relating to
 * cover dates.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class CoverDateReaderController {
  public static final String GET_COVER_DATES_URL = API_ROOT + "/coverdates";
  @Autowired private DirectoryReaderService directoryReaderService;

  /**
   * Returns all cover dates. If the unread parameter is present then only those cover dates with
   * unread comics are returned.
   *
   * @param principal the user principal
   * @param unreadParam the unread flag
   * @return the entries
   */
  @GetMapping(value = GET_COVER_DATES_URL, produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-cover-dates")
  public LoadDirectoryResponse getCoverDates(
      final Principal principal,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final String email = principal.getName();
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info("Loading cover dates: email={} unread={}", email, unread);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(directoryReaderService.getAllCoverDates(email, unread, GET_COVER_DATES_URL));
    return result;
  }
}
