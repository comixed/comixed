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

package org.comixedproject.rest.comicbooks;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.comicbooks.Imprint;
import org.comixedproject.service.comicbooks.ImprintService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ImprintController</code> provides a REST API for working with instances of {@link Imprint}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ImprintController {
  @Autowired private ImprintService imprintService;

  /**
   * Returns all imprints.
   *
   * @return the imprint list
   */
  @GetMapping(value = "/api/comics/imprints", produces = MediaType.APPLICATION_JSON_VALUE)
  @JsonView(View.ImprintListView.class)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.imprint.get-all")
  public List<Imprint> getAll() {
    log.info("Getting all imprints");
    return this.imprintService.getAll();
  }
}
