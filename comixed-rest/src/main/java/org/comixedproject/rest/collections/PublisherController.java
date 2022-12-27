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
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

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
   * Returns the list of all publishers.
   *
   * @return the publishers
   */
  @GetMapping(value = "/api/collections/publishers")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.collections.publishers.get-all")
  public List<Publisher> getAllPublishers() {
    log.info("Getting all publishers");
    return this.comicBookService.getAllPublishersWithSeries();
  }
}
