/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.rest.collections;

import io.micrometer.core.annotation.Timed;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.collections.Publisher;
import org.comixedproject.model.collections.Series;
import org.comixedproject.model.net.collections.LoadPublisherListRequest;
import org.comixedproject.model.net.collections.LoadPublisherListResponse;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>PublisherController</code> provides web endpoints for working with {@link Publisher}
 * instances.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class PublisherController {
  @Autowired private ComicBookService comicBookService;

  /**
   * Returns a page worth of publishers to display.
   *
   * @return the response body
   */
  @PostMapping(value = "/api/collections/publishers")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.publishers.load-list")
  public LoadPublisherListResponse loadPublisherList(
      @RequestBody final LoadPublisherListRequest request) {
    final int page = request.getPage();
    final int size = request.getSize();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();
    log.info("Getting all publishers");
    return this.comicBookService.getAllPublishersWithSeries(page, size, sortBy, sortDirection);
  }

  /**
   * Returns the details for a single publisher.
   *
   * @param name the publisher name
   * @return the details
   */
  @PostMapping(value = "/api/collections/publishers/{name}")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.publishers.load-detail")
  public List<Series> getPublisherDetail(@PathVariable("name") final String name) {
    log.info("Getting publisher detail: name={}", name);
    return this.comicBookService.getPublisherDetail(name);
  }
}
