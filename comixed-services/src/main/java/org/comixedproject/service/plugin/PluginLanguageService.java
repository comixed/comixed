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

package org.comixedproject.service.plugin;

import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.net.plugin.PluginLanguage;
import org.comixedproject.plugins.PluginRuntimeRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <code>PluginLanguageService</code> provides a service for working with plugin languages.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class PluginLanguageService {
  @Autowired PluginRuntimeRegistry pluginRuntimeRegistry;

  /**
   * Returns the list of all plugin languages.
   *
   * @return the plugin language list
   */
  public List<PluginLanguage> getPluginLanguageList() {
    log.debug("Loading the list of all plugin languages");
    return this.pluginRuntimeRegistry.getPluginRuntimeList().stream()
        .map(entry -> new PluginLanguage(entry.getName()))
        .toList();
  }
}
