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
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.service.comic.PageService;
import org.comixedproject.service.library.DuplicatePageException;
import org.comixedproject.service.library.DuplicatePageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

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
  @Autowired private PageService pageService;

  /**
   * Returns the list of duplicate pages.
   *
   * @return the duplicate page list
   */
  @GetMapping(value = "/api/library/pages/duplicates", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.DuplicatePageList.class)
  @PreAuthorize("hasRole('ADMIN')")
  public List<DuplicatePage> getDuplicatePageList() {
    log.info("Getting list of duplicate pages");
    return this.duplicatePageService.getDuplicatePages();
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
  public DuplicatePage getForHash(@PathVariable("hash") final String hash)
      throws DuplicatePageException {
    log.info("Loading duplicate page detail: hash={}", hash);
    return this.duplicatePageService.getForHash(hash);
  }
}
