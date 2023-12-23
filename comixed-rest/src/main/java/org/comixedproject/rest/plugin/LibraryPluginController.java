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

package org.comixedproject.rest.plugin;

import com.fasterxml.jackson.annotation.JsonView;
import io.micrometer.core.annotation.Timed;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.plugin.CreatePluginRequest;
import org.comixedproject.model.net.plugin.UpdatePluginRequest;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.service.plugin.LibraryPluginException;
import org.comixedproject.service.plugin.LibraryPluginService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * <code>LibraryPluginController</code> provides APIs for working with instances of {@link
 * LibraryPlugin}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LibraryPluginController {
  @Autowired private LibraryPluginService libraryPluginService;

  /**
   * Returns the list of all plugins.
   *
   * <p>Filters out admin-only plugins if the user is not an admin.
   *
   * @param principal the user principal
   * @return the plugin list
   * @throws LibraryPluginException if an error occurs
   */
  @GetMapping(value = "/api/plugins", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('READER', 'ADMIN')")
  @Timed(value = "comixed.plugins.get-all")
  @JsonView(View.LibraryPluginList.class)
  public List<LibraryPlugin> getAllPlugins(final Principal principal)
      throws LibraryPluginException {
    final String email = principal.getName();
    log.info("Getting the list of all plugins for user: {}", email);
    return this.libraryPluginService.getAllPlugins(email);
  }

  /**
   * Creates a new plugin.
   *
   * @param request the request body
   * @return the new plugin
   * @throws LibraryPluginException if an error occurs
   */
  @PostMapping(
      value = "/api/plugins",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.plugins.create")
  @JsonView(View.LibraryPluginList.class)
  public LibraryPlugin createPlugin(@RequestBody final CreatePluginRequest request)
      throws LibraryPluginException {
    @NonNull final String filename = request.getFilename();
    @NonNull final String language = request.getLanguage();
    log.info("Creating plugin: langauge={} filename={}", language, filename);
    return this.libraryPluginService.createPlugin(language, filename);
  }

  /**
   * Updates a plugin.
   *
   * @param id the plugin id
   * @param request the plugin
   * @return the updated plugin
   * @throws LibraryPluginException if an error occurs
   */
  @PutMapping(
      value = "/api/plugins/{pluginId}",
      produces = MediaType.APPLICATION_JSON_VALUE,
      consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.plugins.update")
  @JsonView(View.LibraryPluginList.class)
  public LibraryPlugin updatePlugin(
      @PathVariable("pluginId") final long id, @RequestBody() final UpdatePluginRequest request)
      throws LibraryPluginException {
    @NonNull final Boolean adminOnly = request.getAdminOnly();
    final @NonNull Map<String, String> properties = request.getProperties();

    log.info("Updating plugin: id={} admin-only={}", id, adminOnly);
    return this.libraryPluginService.updatePlugin(id, adminOnly, properties);
  }

  /**
   * Deletes a plugin.
   *
   * @param id the plugin id
   * @throws LibraryPluginException if an error occurs
   */
  @DeleteMapping(value = "/api/plugins/{pluginId}")
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.plugins.delete")
  @JsonView(View.LibraryPluginList.class)
  public void deletePlugin(@PathVariable("pluginId") final long id) throws LibraryPluginException {
    log.info("Deleting plugin: id={}", id);
    this.libraryPluginService.deletePlugin(id);
  }
}
