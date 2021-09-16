/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.rest.comicbooks;

import com.fasterxml.jackson.annotation.JsonView;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.ComicFormat;
import org.comixedproject.service.comicbooks.ComicFormatService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ComicFormatController</code> provides a set of REST APIs for working with the instances of
 * {@link ComicFormat}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicFormatController {
  @Autowired private ComicFormatService comicFormatService;

  /**
   * Retrieves the list of all comic formats and publishes them.
   *
   * @return the list of comic formats
   */
  @GetMapping(value = "/api/comics/types/format", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ComicFormatList.class)
  public List<ComicFormat> getAll() {
    log.info("Getting all comic formats");
    return this.comicFormatService.getAll();
  }
}
