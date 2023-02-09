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

package org.comixedproject.rest.comicpages;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicpages.DeletedPage;
import org.comixedproject.service.comicpages.DeletedPageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Log4j2
public class DeletedPageController {
  @Autowired private DeletedPageService deletedPageService;

  /**
   * Loads the list of all pages marked for deletion.
   *
   * @return the pages list
   */
  @GetMapping(value = "/api/pages/deleted", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView({View.DeletedPageList.class})
  public List<DeletedPage> loadAll() {
    log.info("Loading all deleted pages");
    return this.deletedPageService.loadAll();
  }
}
