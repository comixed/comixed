/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>DuplicateComicController</code> provides web endpoints for working with duplicate comics.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class DuplicateComicController {
  @Autowired private ComicBookService comicBookService;

  /**
   * Returns the list of comic details containing duplicate pages.
   *
   * @return the comics
   */
  @GetMapping(value = "/api/library/comics/duplicates", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView({View.ComicListView.class})
  @PreAuthorize("hasRole('ADMIN')")
  public List<ComicDetail> getDuplicateComics() {
    log.info("Loading all duplicate comics");
    return this.comicBookService.findDuplicateComics();
  }
}
