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

package org.comixedproject.opds.rest;

import io.micrometer.core.annotation.Timed;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.opds.service.OPDSNavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>OPDSLibraryController</code> provides the web interface for accessing the OPDS feeds.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class OPDSLibraryController {
  @Autowired private OPDSNavigationService opdsNavigationService;

  /**
   * Returns the root feed.
   *
   * @return the feed
   */
  @GetMapping(value = "/opds", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.opds.library.get-root")
  @ResponseBody
  public OPDSNavigationFeed getRootFeed() {
    log.info("Loading OPDS root navigation feed");
    return this.opdsNavigationService.getRootFeed();
  }

  /**
   * Returns the root library feed.
   *
   * @param unread the unread flag
   * @return the feed
   */
  @GetMapping(value = "/opds/library", produces = MediaType.APPLICATION_XML_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.opds.library.get-feed")
  @ResponseBody
  public OPDSNavigationFeed getLibraryFeed(
      @RequestParam(name = "unread", defaultValue = "false") final boolean unread) {
    log.info("Loading OPDS library feed: unread={}", unread);
    return this.opdsNavigationService.getLibraryFeed(unread);
  }
}
