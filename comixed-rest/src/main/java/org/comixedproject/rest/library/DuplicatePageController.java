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
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.model.net.library.LoadDuplicatePageListRequest;
import org.comixedproject.model.net.library.LoadDuplicatePageListResponse;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.library.DuplicatePageException;
import org.comixedproject.service.library.DuplicatePageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>DuplicatePageController</code> provides endpoints for working with {@link DuplicatePage}
 * instances.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class DuplicatePageController {
  @Autowired private DuplicatePageService duplicatePageService;
  @Autowired private ComicPageService comicPageService;

  /**
   * Returns the list of duplicate pages.
   *
   * @return the duplicate page list
   */
  @PostMapping(
      value = "/api/library/pages/duplicates",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageList.class)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.duplicate-page.get-all")
  public LoadDuplicatePageListResponse getDuplicatePageList(
      @RequestBody final LoadDuplicatePageListRequest request) {
    final int page = request.getPage();
    final int size = request.getSize();
    final String sortBy = request.getSortBy();
    final String sortDirection = request.getSortDirection();

    log.info(
        "Getting list of duplicate pages: page={} size={} sort={} direction={}",
        page,
        size,
        sortBy,
        sortDirection);
    return new LoadDuplicatePageListResponse(
        this.duplicatePageService.getDuplicatePages(page, size, sortBy, sortDirection),
        this.duplicatePageService.getDuplicatePageCount());
  }

  /**
   * Loads a single duplicate page for the given hash.
   *
   * @param hash the hash
   * @return the duplicate page
   * @throws DuplicatePageException if the hash is invalid
   */
  @GetMapping(
      value = "/api/library/pages/duplicates/{hash}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageDetail.class)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.duplicate-page.get-for-hash")
  public DuplicatePage getForHash(@PathVariable("hash") final String hash)
      throws DuplicatePageException {
    log.info("Loading duplicate page detail: hash={}", hash);
    return this.duplicatePageService.getForHash(hash);
  }
}
