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
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.plugin.PluginLanguage;
import org.comixedproject.service.plugin.PluginLanguageService;
import org.comixedproject.views.View;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>PluginLanguageController</code> provides a web interface for working with instances of
 * {@link PluginLanguage}.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class PluginLanguageController {
  @Autowired private PluginLanguageService pluginLanguageService;

  /**
   * Returns the list of plugin languages.
   *
   * @return the language list
   */
  @GetMapping(value = "/api/plugins/languages", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('ADMIN')")
  @Timed(value = "comixed.plugin-language.get-all")
  @JsonView(View.PluginLanguageList.class)
  public List<PluginLanguage> loadPluginLanguageList() {
    log.info("Loading the list of plugin languages");
    return this.pluginLanguageService.getPluginLanguageList();
  }
}
