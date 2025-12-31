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

package org.comixedproject.plugins;

import java.util.List;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.model.plugin.LibraryPluginProperty;
import org.comixedproject.model.plugin.PluginType;

/**
 * <code>PluginRuntime</code> defines type for providing a runtime environment for plugins.
 *
 * @author Darryl L. Pierce
 */
public interface PluginRuntime {
  /**
   * Returns the plugin's name.
   *
   * @param filename the plugin filename
   * @return the name
   */
  String getName(String filename);

  /**
   * Returns the plugin's version.
   *
   * @param filename the plugin filename
   * @return the version
   */
  String getVersion(String filename);

  /**
   * Returns the type of the plugin.
   *
   * @param filename the plugin filename
   * @return the type
   */
  PluginType getPluginType(String filename);

  /**
   * Loads the list of properties from the plugin.
   *
   * @param filename the plugin filename
   * @return the property list
   */
  List<LibraryPluginProperty> getProperties(String filename);

  /**
   * Executes the given plugin. The comic book id is provided as the second argument.
   *
   * @param libraryPlugin the libraryPlugin
   * @param comicBookId the comic book id
   */
  void execute(LibraryPlugin libraryPlugin, Long comicBookId);

  /**
   * Executes the given plugin. The list of comic book ids are provided as the second argument.
   *
   * @param libraryPlugin the libraryPlugin
   * @param comicBookIds the comic book ids
   */
  void execute(LibraryPlugin libraryPlugin, List<Long> comicBookIds);

  /**
   * Defines a property for the plugin runtime.
   *
   * @param propertyName the property name
   * @param propertyValue the property value
   */
  void addProperty(String propertyName, Object propertyValue);
}
