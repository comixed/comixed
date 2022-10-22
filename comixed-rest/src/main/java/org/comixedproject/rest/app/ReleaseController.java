/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

package org.comixedproject.rest.app;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.text.ParseException;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.app.BuildDetails;
import org.comixedproject.model.net.app.LatestReleaseDetails;
import org.comixedproject.service.app.ReleaseService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ReleaseController</code> handles requests for build details.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ReleaseController {
  @Autowired private ReleaseService releaseService;

  /**
   * Retrieves the build details.
   *
   * @return the build details
   * @throws ParseException if an error occurs
   */
  @GetMapping(value = "/api/app/release/current", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.release.get-current")
  @JsonView(View.ReleaseDetails.class)
  public BuildDetails getCurrentRelease() throws ParseException {
    log.info("Getting current release details");
    return this.releaseService.getCurrentReleaseDetails();
  }

  /**
   * Retrieves the latest release details for ComiXed.
   *
   * @return the release details
   */
  @GetMapping(value = "/api/app/release/latest", produces = MediaType.APPLICATION_JSON_VALUE)
  @Timed(value = "comixed.release.get-latest")
  @JsonView(View.ReleaseDetails.class)
  public LatestReleaseDetails getLatestRelease() {
    log.info("Getting latest release details");
    return this.releaseService.getLatestReleaseDetails();
  }
}
