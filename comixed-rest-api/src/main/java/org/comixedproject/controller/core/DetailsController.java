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

package org.comixedproject.controller.core;

import java.text.ParseException;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.auditlog.AuditableEndpoint;
import org.comixedproject.model.core.BuildDetails;
import org.comixedproject.model.net.ApiResponse;
import org.comixedproject.service.core.DetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>DetailsController</code> handles requests for build details.
 *
 * @author Darryl L. Pierce
 */
@RestController
@RequestMapping("/api/core")
@Log4j2
public class DetailsController {
  @Autowired private DetailsService detailsService;

  /**
   * Retrieves the build details.
   *
   * @return the build details
   */
  @GetMapping("/build-details")
  @AuditableEndpoint
  public ApiResponse<BuildDetails> getBuildDetails() {
    log.info("Getting application build details");
    final ApiResponse<BuildDetails> result = new ApiResponse<>();

    try {
      final BuildDetails details = this.detailsService.getBuildDetails();
      result.setSuccess(true);
      result.setResult(details);
    } catch (ParseException error) {
      log.error("Failed to get build details", error);
      result.setError(error.getMessage());
      result.setSuccess(false);
    }

    return result;
  }
}
