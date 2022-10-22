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

package org.comixedproject.rest.admin;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.admin.ConfigurationOption;
import org.comixedproject.model.net.admin.SaveConfigurationOptionsRequest;
import org.comixedproject.model.net.admin.SaveConfigurationOptionsResponse;
import org.comixedproject.service.admin.ConfigurationOptionException;
import org.comixedproject.service.admin.ConfigurationService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>ConfigurationController</code> provides a REST interface for working with intances of
 * {@link ConfigurationOption}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ConfigurationController {
  @Autowired private ConfigurationService configurationService;

  /**
   * Retrieves all configuration options.
   *
   * @return the configuration options
   */
  @GetMapping(value = "/api/admin/config", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.configuration.get-all")
  @JsonView(View.ConfigurationList.class)
  public List<ConfigurationOption> getAll() {
    log.info("Getting all configuration options");
    return this.configurationService.getAll();
  }

  /**
   * Saves the provided configuration options. Returns all global configuration options.
   *
   * @param request the request body
   * @return the response body
   * @throws ConfigurationOptionException if an error occurs
   */
  @PostMapping(
      value = "/api/admin/config",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.configuration.save")
  @JsonView(View.ConfigurationList.class)
  public SaveConfigurationOptionsResponse saveOptions(
      @RequestBody() final SaveConfigurationOptionsRequest request)
      throws ConfigurationOptionException {
    log.info("Saving configuration options");
    return new SaveConfigurationOptionsResponse(
        this.configurationService.saveOptions(request.getOptions()));
  }
}
